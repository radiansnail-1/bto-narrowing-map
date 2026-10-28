import type { Metadata } from 'next';
import Link from 'next/link';

const hdbProcess = 'https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat';
const hdbModes = 'https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat/modes-of-sales';

export const metadata: Metadata = {
  title: '新加坡 BTO 地图与项目筛选工具',
  description: '用 Where To BTO 按通勤、预算、附近设施和预计等待时间筛选新加坡 BTO 项目。未公布的数据会标记为未知。',
  alternates: { canonical: '/zh', languages: { 'en-SG': '/', 'zh-Hans': '/zh', 'x-default': '/' } },
  openGraph: {
    title: '新加坡 BTO 地图与项目筛选工具 | Where To BTO',
    description: '按通勤、预算、附近设施和预计等待时间筛选新加坡 BTO 项目。',
    url: '/zh',
    locale: 'zh_CN',
    alternateLocale: ['en_SG'],
    type: 'website',
  },
};

export default function ChineseLandingPage() {
  return <main className="content-main narrow-content" lang="zh-Hans">
    <nav className="breadcrumbs" aria-label="面包屑导航"><Link href="/">English</Link><span>/</span><span>简体中文</span></nav>
    <header className="content-hero">
      <p className="data-line">Where To BTO · 新加坡组屋项目筛选工具</p>
      <h1>按家庭实际需求比较新加坡 BTO 项目</h1>
      <p>Where To BTO 是一款独立的网页工具，帮助你根据通勤、预算、附近设施和预计等待时间缩小项目范围。项目资料以 HDB 已公布的信息为准；这不是 HDB 官方服务。</p>
      <div className="hero-actions">
        <Link className="primary-link" href="/">打开英文互动地图</Link>
        <Link className="secondary-link" href="/bto-projects">浏览英文项目目录</Link>
      </div>
    </header>

    <section className="content-section">
      <h2>四项筛选条件</h2>
      <div className="article-body">
        <section><h3>通勤</h3><p>可按所选工作地点筛看项目的大致直线距离。地图筛选不是公共交通路线，也不代表实际通勤时间。</p></section>
        <section><h3>预算</h3><p>可依据已公布的项目价格范围作初步筛选。价格与贷款资格、补助或家庭可负担金额并不相同；请用 HDB 的正式评估和自己的财务资料确认。</p></section>
        <section><h3>附近设施</h3><p>可查看记录在项目资料中的 MRT、餐饮与购物、医疗、学校及公园休闲设施。资料是有限的周边参考，并非完整目录；地图中的距离为近似直线距离。</p></section>
        <section><h3>预计等待时间</h3><p>可按 HDB 已公布的预计等待时间筛选。预计时间不是交屋保证，实际进度应以 HDB 对具体项目的最新信息为准。</p></section>
      </div>
    </section>

    <section className="content-section">
      <h2>资料未知时会怎样显示？</h2>
      <p>HDB 尚未公布的项目名称、价格、户型或等待时间会保留为“尚未公布”或“未知”。未知项目不会因此被算作符合，也不会被算作不符合。工具把结果分为符合已回答条件、因资料不足暂无法判断，以及存在条件取舍；它不会给项目排名，也不会替你选出唯一赢家。</p>
    </section>

    <section className="content-section">
      <h2>按你的问题选择英文工具</h2>
      <ul>
        <li><Link href="/">英文互动地图</Link>：按四项条件缩小项目范围，并查看已记录的周边设施。</li>
        <li><Link href="/bto-projects">英文 BTO 项目目录</Link>：浏览已推出、已宣布及规划中的项目记录。</li>
        <li><Link href="/tools/dia-calculator">英文 DIA 计算器</Link>：查看指定延期收入评估情景下的付款与资金估算；不判断资格。</li>
        <li><Link href="/tools/bto-roadmap">英文 BTO 资金时间表</Link>：按假设的储蓄和付款时间，查看现金与 CPF 的月度规划。</li>
        <li><Link href="/methodology">英文资料与筛选方法</Link>：了解资料来源、未知值处理和距离限制。</li>
      </ul>
    </section>

    <section className="content-section">
      <h2>先以 HDB 官方资料为准</h2>
      <p>Where To BTO 提供项目浏览和假设情景，不受 HDB 委托，也不处理申请。请直接核对 HDB 对销售活动、项目详情、资格和购买流程的最新说明。</p>
      <ul className="source-register">
        <li><div><strong>新加坡建屋发展局（HDB）</strong><span>新组屋购买流程</span></div><a href={hdbProcess} rel="noreferrer">Process for Buying a New Flat ↗</a></li>
        <li><div><strong>新加坡建屋发展局（HDB）</strong><span>BTO、SBF 与开放预订的销售方式</span></div><a href={hdbModes} rel="noreferrer">Modes of Sale ↗</a></li>
      </ul>
    </section>
    <aside className="content-callout"><h2>本页语言范围</h2><p>本页是 Where To BTO 的简体中文产品介绍。互动地图、项目记录和资金工具目前为英文界面；点击后会进入相应英文页面。</p><Link className="secondary-link" href="/">返回英文首页</Link></aside>
  </main>;
}
