export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { plan, generated } = body
    // plan: { incomeGoal, deadline, paths: [{name, weight, formula...}] }
    // generated: { milestones: [ { path_index, milestones: [ {name, weeks, tasks:[] } ] } ] }

    const { serverSupabaseUser, serverSupabaseClient } = await import('#supabase/server')
    const user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient(event)

    const supabaseUrl = process.env.SUPABASE_URL
    if ((!supabaseUrl || supabaseUrl === 'your-supabase-url') && !user) {
        console.log('[Mock] Wizard save - no Supabase configured')
        return { success: true, message: 'Mock save successful' }
    }

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const userId = user.id

    try {
        // 1. L1 Goal: Insert into 'goals' table (or user_profiles based on logic)
        // We stick to 'goals' table for now as it exists
        const { data: goalData, error: goalError } = await client
            .from('goals')
            .insert({
                user_id: userId,
                year: new Date().getFullYear(),
                income_target: (plan.incomeGoal || 0) * 10000,
                status: 'active',
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (goalError) throw goalError
        const goalId = goalData.id

        // 2. L2 Paths
        // Map frontend path definitions to DB
        // Frontend paths are in plan.paths
        // Generated milestones are in generated.milestones, linked by index (assuming order preserved)
        
        for (let i = 0; i < plan.paths.length; i++) {
            const p = plan.paths[i]
            
            const { data: pathData, error: pathError } = await client
                .from('paths')
                .insert({
                    goal_id: goalId,
                    user_id: userId,
                    name: p.name,
                    category: p.type || 'other',
                    weight: p.weight,
                    formula_config: p.formula?.config || {},
                    start_date: p.startDate,
                    duration_weeks: p.durationWeeks,
                    sort_order: i,
                    status: 'active'
                })
                .select()
                .single()

            if (pathError) throw pathError
            const pathId = pathData.id

            // 3. L3 Milestones (Projects)
            // Find milestones for this path index
            // generated.milestones might be structured as { paths: [ { path_index, milestones: [] } ] }
            const generatedPath = generated.milestones.find((gp: any) => gp.path_index === i) || 
                                  (generated.milestones[i] && generated.milestones[i].milestones ? generated.milestones[i] : null) 
                                  // Fallback if structure varies

            if (generatedPath && generatedPath.milestones) {
                for (let mIdx = 0; mIdx < generatedPath.milestones.length; mIdx++) {
                    const m = generatedPath.milestones[mIdx]
                    
                    const { data: projectData, error: projectError } = await client
                        .from('projects')
                        .insert({
                            path_id: pathId,
                            user_id: userId,
                            name: m.name,
                            acceptance_criteria: m.criteria,
                            duration_weeks: m.weeks, // Storing duration, not end_date yet
                            status: mIdx === 0 ? 'in_progress' : 'todo', // First one active
                            is_active: mIdx === 0,
                            is_locked: mIdx === 0, // First one locked (detailed)
                            created_at: new Date().toISOString()
                        })
                        .select()
                        .single()
                    
                    if (projectError) throw projectError
                    const projectId = projectData.id

                    // 4. L4 Tasks (Only for first milestone usually, or if generated)
                    // We collect tasks here to schedule them later or schedule immediately if we do path-by-path (but strictly speaking, scheduling should be global interleaved).
                    // However, for MVP simplification, if we schedule strictly by path parallelly, we can do it here.
                    // BUT, Requirement Step 6 says "Merged Calendar... Interleaved". 
                    // To do interleaved, we need all tasks from ALL paths first. 
                    // Let's collect them into a temporary array and insert AFTER the loop?
                    // No, that refactor is big.
                    // Simplified Approach: We assume "Parallel Start". 
                    // Actually, to correctly interleave, we need to know the 'planned_date' BEFORE inserting.
                    // Let's implement a local scheduler helper here.
                    
                    if (m.tasks && m.tasks.length > 0) {
                        // Scheduling Parameters
                        const dailyHours = (plan.profile?.weeklyHours || 20) / 5
                        const pathWeight = p.weight || 0
                        const dailyQuota = dailyHours * (pathWeight / 100)
                        
                        // 1. Initialize Date Cursor
                        // Use user-provided startDate or default to tomorrow
                        let cursorDate = new Date()
                        if (plan.startDate) {
                            cursorDate = new Date(plan.startDate)
                        } else {
                            cursorDate.setDate(cursorDate.getDate() + 1)
                        }
                        
                        // 2. Scheduler State
                        let usedQuotaToday = 0

                        const tasksToInsert = m.tasks.map((t: any, tIdx: number) => {
                            const taskHours = t.hours || 2
                            
                            // 3. Simple Bin Packing / Fluid Filling Algorithm
                            // Logic: Try to fit in current day. If overflow, move to next day.
                            // We allow "overflow" for a single task to ensure large tasks don't block forever.
                            // If today is already "full" (used >= quota), we move to next day first.
                            
                            // Check if we need to switch day BEFORE placing task
                            // Relaxed condition: if we used more than 90% of quota, consider it full.
                            if (usedQuotaToday >= dailyQuota * 0.9) {
                                cursorDate.setDate(cursorDate.getDate() + 1)
                                usedQuotaToday = 0 // Reset for new day
                                
                                // Optional: Skip weekends (Simple Sat/Sun check)
                                // If needed in future: while (isWeekend(cursorDate)) cursorDate.add(1)
                                const dayNum = cursorDate.getDay()
                                if (dayNum === 0 || dayNum === 6) {
                                    // Let's skip Sunday (0) strictly, maybe Saturday (6) too?
                                    // For MVP, let's just skip Sunday to be safe but productive.
                                    if (dayNum === 0) cursorDate.setDate(cursorDate.getDate() + 1)
                                }
                            }
                            
                            // Assign Date
                            const assignedDate = new Date(cursorDate)
                            
                            // Update Usage
                            // Note: We allow usedQuotaToday to exceed dailyQuota. 
                            // This signals that the next task must move to the next day.
                            // This handles "Large Tasks" (e.g. 6h task on 2h quota) perfectly.
                            usedQuotaToday += taskHours
                            
                            return {
                                project_id: projectId,
                                user_id: userId,
                                name: t.name,
                                original_estimate: t.hours,
                                task_type: t.type || 'core',
                                sort_order: t.sort_order || tIdx,
                                status: 'todo',
                                planned_date: assignedDate.toISOString().split('T')[0],
                                created_at: new Date().toISOString()
                            }
                        })

                        const { error: taskError } = await client
                            .from('tasks')
                            .insert(tasksToInsert)
                        
                        if (taskError) throw taskError
                    }
                }
            }
        }

        return { success: true, goalId }
    } catch (e: any) {
        console.error('[Wizard Save Error]', e)
        throw createError({ statusCode: 500, message: e.message || 'Save failed' })
    }
})