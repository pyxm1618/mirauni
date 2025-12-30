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
        }
    }
})
