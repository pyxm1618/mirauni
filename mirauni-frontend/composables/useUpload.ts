/**
 * 图片上传 composable
 */
export function useUpload() {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    /**
     * 压缩图片
     */
    async function compressImage(file: File, maxSize = 500 * 1024, maxWidth = 800): Promise<File> {
        // 如果图片小于限制，直接返回
        if (file.size <= maxSize) {
            return file
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Image()
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let { width, height } = img

                    // 如果宽度超过限制，按比例缩放
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width
                        width = maxWidth
                    }

                    canvas.width = width
                    canvas.height = height

                    const ctx = canvas.getContext('2d')!
                    ctx.drawImage(img, 0, 0, width, height)

                    // 尝试不同质量压缩
                    let quality = 0.9
                    const tryCompress = () => {
                        canvas.toBlob(
                            (blob) => {
                                if (!blob) {
                                    reject(new Error('压缩失败'))
                                    return
                                }

                                if (blob.size <= maxSize || quality <= 0.1) {
                                    const compressedFile = new File([blob], file.name, {
                                        type: 'image/jpeg'
                                    })
                                    resolve(compressedFile)
                                } else {
                                    quality -= 0.1
                                    tryCompress()
                                }
                            },
                            'image/jpeg',
                            quality
                        )
                    }
                    tryCompress()
                }
                img.onerror = () => reject(new Error('图片加载失败'))
                img.src = e.target?.result as string
            }
            reader.onerror = () => reject(new Error('读取文件失败'))
            reader.readAsDataURL(file)
        })
    }

    /**
     * 上传头像
     */
    async function uploadAvatar(file: File): Promise<string> {
        if (!user.value) {
            throw new Error('请先登录')
        }

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            throw new Error('请上传 JPG/PNG/WebP/GIF 格式的图片')
        }

        // 压缩图片
        const compressedFile = await compressImage(file, 500 * 1024)

        // 上传到 Supabase Storage
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${user.value.id}/avatar_${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, compressedFile, {
                upsert: true,
                contentType: compressedFile.type
            })

        if (uploadError) {
            console.error('上传头像失败:', uploadError)
            throw new Error('上传失败')
        }

        // 获取公开 URL
        const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(path)

        const avatarUrl = urlData.publicUrl

        // 更新用户头像
        const { error: updateError } = await supabase
            .from('users')
            .update({
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.value.id)

        if (updateError) {
            console.error('更新头像URL失败:', updateError)
            throw new Error('更新失败')
        }

        return avatarUrl
    }

    /**
     * 上传项目图片
     */
    async function uploadProjectImage(file: File, projectId: string): Promise<string> {
        if (!user.value) {
            throw new Error('请先登录')
        }

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            throw new Error('请上传 JPG/PNG/WebP 格式的图片')
        }

        // 压缩图片
        const compressedFile = await compressImage(file, 2 * 1024 * 1024, 1920)

        // 上传
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${projectId}/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
            .from('projects')
            .upload(path, compressedFile, {
                contentType: compressedFile.type
            })

        if (uploadError) {
            console.error('上传项目图片失败:', uploadError)
            throw new Error('上传失败')
        }

        const { data: urlData } = supabase.storage
            .from('projects')
            .getPublicUrl(path)

        return urlData.publicUrl
    }

    return {
        compressImage,
        uploadAvatar,
        uploadProjectImage
    }
}
