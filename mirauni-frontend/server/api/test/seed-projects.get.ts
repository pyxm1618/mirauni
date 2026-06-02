
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)

    if (!user) {
        return {
            success: false,
            message: '请先登录前端项目 (http://localhost:3000/login)，然后再访问此接口。'
        }
    }

    // 使用 Service Role Client 绕过 RLS 限制
    const client = serverSupabaseServiceRole(event)

    // 1. 定义虚拟项目数据
    const projects = [
        {
            title: 'AI 法律助手 (LegalAI)',
            summary: '基于大模型的法律咨询助手，帮助初创公司解决合同审查和合规问题。',
            category: 'ai',
            roles_needed: ['backend', 'ai'],
            skills_required: ['python', 'langchain', 'postgres'],
            work_mode: 'remote',
            cooperation_type: 'equity',
            status: 'active',
            user_id: user.id,
            view_count: 128,
            description: '这是一个基于 LLM 的法律助手项目，旨在为中小企业提供低成本的法律咨询服务...\n\n### 愿景\n让法律服务触手可及。',
            description_visible: true,
            background_visible: true,
            vision_visible: true,
            team_visible: true,
            demo_visible: true
        },
        {
            title: '去中心化画廊 (ArtChain)',
            summary: '为独立艺术家打造的 NFT 展示与交易平台，支持跨链与低 Gas 费。',
            category: 'content',
            roles_needed: ['frontend', 'design'],
            skills_required: ['react', 'solidity', 'web3.js'],
            work_mode: 'hybrid',
            cooperation_type: 'revenue_share',
            status: 'active',
            user_id: user.id,
            view_count: 345,
            description: '一个专注于数字艺术品的交易平台...',
            description_visible: true,
            background_visible: true
        },
        {
            title: '智能家居中枢 (SmartHub)',
            summary: '开源的智能家居控制中心，兼容 HomeAssistant 协议，隐私优先。',
            category: 'hardware',
            roles_needed: ['fullstack', 'hardware'],
            skills_required: ['cpp', 'rust', 'mqtt'],
            work_mode: 'onsite',
            cooperation_type: 'volunteer',
            status: 'active',
            user_id: user.id,
            view_count: 89,
            description: '让智能家居更安全，更私密...',
            description_visible: true
        }
    ]

    // 2. 插入数据
    const results = []
    for (const p of projects) {
        // 使用 Service Role Client 进行插入
        const { data, error } = await client.from('projects').insert(p).select().single()
        if (error) {
            results.push({ title: p.title, status: 'error', error: error.message })
        } else {
            results.push({ title: p.title, status: 'success', id: data.id })
        }
    }

    return {
        success: true,
        message: '操作完成',
        data: results
    }
})
