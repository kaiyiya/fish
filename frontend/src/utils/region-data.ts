export type District = { name: string }
export type City = { name: string; districts: District[] }
export type Province = { name: string; cities: City[] }

// 省/市/区（全量行政区划数据）
// 目标：给地址编辑页提供“省/市/区”的选择器，避免手动输入。
//
// 这里不再手写简化数据，而是从 `@province-city-china/data` 自动生成：
// - 省：province 层级（city=0, area=0, town=0）
// - 市：area=0, town=0 且 city!=0（直辖市/特别行政区如果没有市层级，则退化为“省内只有一个市”）
// - 区/县：town=0 且 area!=0
//
// 说明：区/县名称尽量使用数据源原文；若你的前端需要“区/县/街道”更细层级，可以再进一步扩展 town 层级。
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AREA_DATA: any[] = require('@province-city-china/data')

function isZero(v: unknown): boolean {
  return v === 0 || v === '0' || v === '00' || v === null || v === undefined
}

function toCode(v: unknown): string {
  return v === null || v === undefined ? '' : String(v)
}

function buildRegionData(): Province[] {
  const byProvince: Record<string, any[]> = {}
  for (const item of AREA_DATA) {
    const prov = toCode(item.province)
    if (!prov) continue
    if (!byProvince[prov]) byProvince[prov] = []
    byProvince[prov].push(item)
  }

  const provinceEntries = AREA_DATA.filter(
    (x) => !isZero(x.province) && isZero(x.city) && isZero(x.area) && isZero(x.town),
  )
    .slice()
    .sort((a, b) => Number(a.code) - Number(b.code))

  const provinces: Province[] = []
  for (const p of provinceEntries) {
    const provCode = toCode(p.province)
    const provName = p.name as string
    const provItems = byProvince[provCode] || []

    // 市层级（多数省份有；直辖市有时只有省层级，因此会走 fallback）
    const cityEntries = provItems
      .filter((x) => isZero(x.area) && isZero(x.town) && !isZero(x.city))
      .slice()
      .sort((a, b) => Number(a.code) - Number(b.code))

    const districtItems = provItems.filter((x) => isZero(x.town) && !isZero(x.area))

    if (cityEntries.length > 0) {
      const cities: City[] = cityEntries.map((c) => {
        const cityCode = toCode(c.city)
        const districts = districtItems
          .filter((d) => toCode(d.city) === cityCode)
          .slice()
          .sort((a, b) => Number(a.code) - Number(b.code))
          .map((d) => ({ name: d.name as string }))

        return { name: c.name as string, districts }
      })
      provinces.push({ name: provName, cities })
      continue
    }

    // fallback：若没有“市层级条目”，则把该省下的所有区/县合并到同一个城市里
    const districts = districtItems
      .slice()
      .sort((a, b) => Number(a.code) - Number(b.code))
      .map((d) => ({ name: d.name as string }))
    provinces.push({ name: provName, cities: [{ name: provName, districts }] })
  }

  return provinces
}

export const REGION_DATA: Province[] = buildRegionData()

