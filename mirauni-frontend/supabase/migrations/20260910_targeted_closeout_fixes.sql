BEGIN;

-- =============================================================================
-- P0-1: add_credits must be callable only by service_role.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id UUID, p_credits INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_rows INTEGER;
BEGIN
    IF auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Forbidden';
    END IF;

    UPDATE public.users
    SET unlock_credits = unlock_credits + p_credits,
        is_first_charge = false,
        updated_at = NOW()
    WHERE id = p_user_id;

    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows <> 1 THEN
        RAISE EXCEPTION 'User not found';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.add_credits(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.add_credits(UUID, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.add_credits(UUID, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits(UUID, INTEGER) TO service_role;

-- =============================================================================
-- P1: atomically settle a successful WeChat order and grant its credits once.
-- The row lock serializes duplicate notifications for the same order.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.complete_wechat_payment(
    p_order_no TEXT,
    p_total_fee INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_order public.orders%ROWTYPE;
BEGIN
    IF auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Forbidden';
    END IF;

    SELECT *
    INTO v_order
    FROM public.orders
    WHERE order_no = p_order_no
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_order.amount <> p_total_fee THEN
        RAISE EXCEPTION 'Amount mismatch';
    END IF;

    IF v_order.status = 'paid' THEN
        RETURN TRUE;
    END IF;

    PERFORM public.add_credits(v_order.user_id, v_order.credits);

    UPDATE public.orders
    SET status = 'paid',
        paid_at = COALESCE(paid_at, NOW())
    WHERE id = v_order.id;

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_wechat_payment(TEXT, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_wechat_payment(TEXT, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.complete_wechat_payment(TEXT, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.complete_wechat_payment(TEXT, INTEGER) TO service_role;

-- =============================================================================
-- P0-2: published articles remain publicly readable; CMS writes are server-only.
-- =============================================================================
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS articles_public_read_published ON public.articles;
CREATE POLICY articles_public_read_published
ON public.articles
FOR SELECT
TO anon, authenticated
USING (status = 'published');

REVOKE ALL PRIVILEGES ON TABLE public.articles FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.articles FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.articles FROM authenticated;
GRANT SELECT ON TABLE public.articles TO anon;
GRANT SELECT ON TABLE public.articles TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.articles TO service_role;

-- =============================================================================
-- P1: editing reviewed project content sends an active project back to pending.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.requeue_active_mirauni_project_on_content_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF OLD.status = 'active' AND (
        NEW.title IS DISTINCT FROM OLD.title OR
        NEW.summary IS DISTINCT FROM OLD.summary OR
        NEW.category IS DISTINCT FROM OLD.category OR
        NEW.roles_needed IS DISTINCT FROM OLD.roles_needed OR
        NEW.skills_required IS DISTINCT FROM OLD.skills_required OR
        NEW.work_mode IS DISTINCT FROM OLD.work_mode OR
        NEW.cooperation_type IS DISTINCT FROM OLD.cooperation_type OR
        NEW.description IS DISTINCT FROM OLD.description OR
        NEW.description_visible IS DISTINCT FROM OLD.description_visible OR
        NEW.background IS DISTINCT FROM OLD.background OR
        NEW.background_visible IS DISTINCT FROM OLD.background_visible OR
        NEW.vision IS DISTINCT FROM OLD.vision OR
        NEW.vision_visible IS DISTINCT FROM OLD.vision_visible OR
        NEW.team_info IS DISTINCT FROM OLD.team_info OR
        NEW.team_visible IS DISTINCT FROM OLD.team_visible OR
        NEW.demo_url IS DISTINCT FROM OLD.demo_url OR
        NEW.demo_visible IS DISTINCT FROM OLD.demo_visible
    ) THEN
        NEW.status := 'pending';
        NEW.reject_reason := NULL;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS requeue_active_mirauni_project_on_content_change
ON public.mirauni_projects;

CREATE TRIGGER requeue_active_mirauni_project_on_content_change
BEFORE UPDATE ON public.mirauni_projects
FOR EACH ROW
EXECUTE FUNCTION public.requeue_active_mirauni_project_on_content_change();

NOTIFY pgrst, 'reload schema';

COMMIT;
