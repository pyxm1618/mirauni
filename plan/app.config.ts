export default defineAppConfig({
    ui: {
        primary: 'toon',
        gray: 'cool',
        button: {
            default: {
                size: 'md',
                color: 'white',
                variant: 'solid'
            },
            base: 'border-3 border-black shadow-hard transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:translate-x-[-1px] hover:translate-y-[-1px]',
            variant: {
                solid: 'bg-{color}-500 text-white',
                outline: 'bg-white text-black'
            }
        },
        card: {
            base: 'border-3 border-black shadow-hard',
            background: 'bg-white',
            rounded: 'rounded-xl'
        },
        input: {
            default: {
                size: 'md',
                color: 'white',
                variant: 'outline'
            },
            base: 'border-3 border-black shadow-hard-sm focus:shadow-hard',
            rounded: 'rounded-lg'
        },
        notifications: {
            position: 'top-0 right-0 sm:top-4 sm:right-4 bottom-auto left-auto',
            width: 'w-full sm:w-96',
            container: 'px-4 sm:px-0 py-6 sm:py-0 space-y-3 overflow-y-auto sm:overflow-y-visible max-h-screen sm:max-h-full',
        },
        notification: {
            background: 'bg-white',
            rounded: 'rounded-xl',
            shadow: 'shadow-hard',
            ring: 'ring-2 ring-black',
            title: 'text-sm font-black text-gray-900',
            description: 'mt-1 text-sm leading-4 text-gray-500 font-medium',
            icon: {
                base: 'hidden flex-shrink-0 w-5 h-5', // Hide default icon to use our own or just style it? User wants "pop". Let's keep icon but style it.
                color: 'text-{color}-500'
            },
            progress: {
                base: 'hidden', // Hide progress bar for clean look
            }
        }
    }
})
