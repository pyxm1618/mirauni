const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';
const ENABLE_PRODUCTION_SMOKE = process.env.ENABLE_PRODUCTION_SMOKE === 'true';
const INCLUDE_TRACK = process.env.INCLUDE_TRACK === 'true';

// 安全拦截检查：是否指向生产域名
const isProduction = TARGET_URL.includes('mirauni.com');

console.log(`[Smoke Test] 目标 URL: ${TARGET_URL}`);

if (isProduction && !ENABLE_PRODUCTION_SMOKE) {
  console.error('[Smoke Test] ❌ 警告: 检测到目标 URL 包含生产环境域名，但未设置 ENABLE_PRODUCTION_SMOKE=true。');
  console.error('[Smoke Test] ❌ 拦截生产环境冒烟测试，进程以非零状态码退出！');
  process.exit(1);
}

// 打印测试类型
console.log(`[Smoke Test] 测试环境: ${isProduction ? '生产环境 (只读)' : '本地/Staging 环境'}`);

// 定义要测试的只读端点
const endpoints = [
  { path: '/', method: 'GET' },
  { path: '/sitemap.xml', method: 'GET' },
  { path: '/api/projects', method: 'GET' },
  { path: '/api/developers/search', method: 'GET' },
  { path: '/api/articles', method: 'GET' }
];

async function runTests() {
  let hasFailed = false;

  for (const endpoint of endpoints) {
    const url = `${TARGET_URL.replace(/\/$/, '')}${endpoint.path}`;
    console.log(`[Smoke Test] 正在请求 [${endpoint.method}] ${url} ...`);
    try {
      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'User-Agent': 'Mirauni-Smoke-Test/1.0'
        }
      });
      console.log(`[Smoke Test] 结果: [${endpoint.method}] ${endpoint.path} -> HTTP ${response.status}`);
      if (!response.ok) {
        console.error(`[Smoke Test] ❌ 测试未通过: [${endpoint.method}] ${endpoint.path} 返回非正常状态码`);
        hasFailed = true;
      } else {
        console.log(`[Smoke Test] ✅ 通过: [${endpoint.method}] ${endpoint.path}`);
      }
    } catch (err) {
      console.error(`[Smoke Test] ❌ 网络请求失败: [${endpoint.method}] ${endpoint.path} - 错误: ${err.message}`);
      hasFailed = true;
    }
  }

  // Telemetry 写入检查 (POST /api/track)
  if (INCLUDE_TRACK) {
    // 检查生产环境前置条件：如果是生产，必须设置 ENABLE_PRODUCTION_SMOKE=true
    const allowTrack = !isProduction || ENABLE_PRODUCTION_SMOKE;
    if (allowTrack) {
      const trackUrl = `${TARGET_URL.replace(/\/$/, '')}/api/track`;
      console.log(`[Smoke Test] 正在测试可选 Telemetry 写入 [POST] ${trackUrl} ...`);
      try {
        const response = await fetch(trackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mirauni-Smoke-Test/1.0'
          },
          body: JSON.stringify({ event_name: 'ci_smoke_test' })
        });
        console.log(`[Smoke Test] 结果: [POST] /api/track -> HTTP ${response.status}`);
        if (!response.ok) {
          console.error(`[Smoke Test] ❌ 测试未通过: [POST] /api/track 返回非正常状态码`);
          hasFailed = true;
        } else {
          console.log(`[Smoke Test] ✅ 通过: [POST] /api/track`);
        }
      } catch (err) {
        console.error(`[Smoke Test] ❌ 网络请求失败: [POST] /api/track - 错误: ${err.message}`);
        hasFailed = true;
      }
    } else {
      console.log('[Smoke Test] ℹ️ 跳过 Telemetry 写入测试 (未明确开启生产环境冒烟)');
    }
  } else {
    console.log('[Smoke Test] ℹ️ 未设置 INCLUDE_TRACK=true，跳过 Telemetry 写入测试');
  }

  if (hasFailed) {
    console.error('[Smoke Test] ❌ 冒烟测试失败！');
    process.exit(1);
  } else {
    console.log('[Smoke Test] 🎉 所有的只读/特许冒烟测试检查已全部通过！');
    process.exit(0);
  }
}

runTests();
