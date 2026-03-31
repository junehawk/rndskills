import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const mcps = await getCollection('mcps');
  const skills = await getCollection('skills');
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

  const items = [...mcps, ...skills]
    .sort((a, b) => new Date(b.data.addedAt).getTime() - new Date(a.data.addedAt).getTime())
    .map((item) => ({
      title: item.data.name,
      description: item.data.description,
      pubDate: new Date(item.data.addedAt),
      link: `${context.site}${base ? base.replace(/^\//, '') + '/' : ''}${item.data.category === 'mcp' ? 'mcps' : 'skills'}/${item.data.id}/`,
    }));

  return rss({
    title: 'R&D MCP Hub',
    description: '국내 R&D 연구자를 위한 MCP 서버 및 AI Skill 큐레이션',
    site: context.site!.toString(),
    items,
  });
}
