export const useMessages = () => {
    const unreadCount = useState<number>('unread-messages-count', () => 0)

    const fetchUnreadCount = async () => {
        try {
            const { data } = await useFetch<{ unreadCount: number }>('/api/messages/unread-count')
            if (data.value) {
                unreadCount.value = data.value.unreadCount
            }
        } catch (e) {
            console.error('Failed to fetch unread count', e)
        }
    }

    return {
        unreadCount,
        fetchUnreadCount
    }
}
