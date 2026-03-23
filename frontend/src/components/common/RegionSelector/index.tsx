import { Component } from 'react'
import { View, Text, Picker } from '@tarojs/components'
import './index.scss'
import { REGION_DATA } from '../../../utils/region-data'

type RegionValue = {
  province: string
  city: string
  district: string
}

type Props = {
  value: RegionValue
  onChange: (value: RegionValue) => void
}

type State = {
  provinceIndex: number
  cityIndex: number
  districtIndex: number
}

export default class RegionSelector extends Component<Props, State> {
  state: State = {
    provinceIndex: -1,
    cityIndex: -1,
    districtIndex: -1,
  }

  componentDidMount() {
    this.syncFromValue(this.props.value)
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.value.province !== this.props.value.province ||
      prevProps.value.city !== this.props.value.city ||
      prevProps.value.district !== this.props.value.district
    ) {
      this.syncFromValue(this.props.value)
    }
  }

  syncFromValue(value: RegionValue) {
    const provinceIndex = value.province
      ? REGION_DATA.findIndex((p) => p.name === value.province)
      : -1

    const cities = provinceIndex >= 0 ? REGION_DATA[provinceIndex].cities : []
    const cityIndexFromValue =
      provinceIndex >= 0 && value.city ? cities.findIndex((c) => c.name === value.city) : -1
    const cityIndex = cityIndexFromValue >= 0 ? cityIndexFromValue : cities.length > 0 ? 0 : -1

    const districts =
      provinceIndex >= 0 && cityIndex >= 0 ? cities[cityIndex].districts : []
    const districtIndexFromValue =
      provinceIndex >= 0 && cityIndex >= 0 && value.district
        ? districts.findIndex((d) => d.name === value.district)
        : -1
    const districtIndex =
      districtIndexFromValue >= 0 ? districtIndexFromValue : districts.length > 0 ? 0 : -1

    this.setState({ provinceIndex, cityIndex, districtIndex })
  }

  triggerChange(next: { provinceIndex?: number; cityIndex?: number; districtIndex?: number }) {
    const provinceIndex = next.provinceIndex ?? this.state.provinceIndex
    const cityIndex = next.cityIndex ?? this.state.cityIndex
    const districtIndex = next.districtIndex ?? this.state.districtIndex

    if (provinceIndex < 0) return

    const province = REGION_DATA[provinceIndex]
    const city = province.cities[cityIndex >= 0 ? cityIndex : 0]
    const district = city.districts[districtIndex >= 0 ? districtIndex : 0]

    this.props.onChange({
      province: province.name,
      city: city.name,
      district: district.name,
    })
  }

  render() {
    const { provinceIndex, cityIndex, districtIndex } = this.state

    const province = provinceIndex >= 0 ? REGION_DATA[provinceIndex] : null
    const cities = province ? province.cities : []
    const city = cityIndex >= 0 && cityIndex < cities.length ? cities[cityIndex] : null
    const districts = city ? city.districts : []

    return (
      <View className="region-selector">
        <View className="region-row">
          <View className="region-item">
            <Text className="region-label">省</Text>
            <Picker
              mode="selector"
              range={REGION_DATA}
              rangeKey="name"
              value={provinceIndex >= 0 ? provinceIndex : 0}
              onChange={(e) => {
                const index = e.detail.value
                const nextProvince = REGION_DATA[index]
                if (!nextProvince) return

                this.setState(
                  {
                    provinceIndex: index,
                    cityIndex: 0,
                    districtIndex: 0,
                  },
                  () => {
                    this.triggerChange({ provinceIndex: index, cityIndex: 0, districtIndex: 0 })
                  },
                )
              }}
            >
              <View className="picker-view">
                <Text className={provinceIndex >= 0 ? 'picker-text' : 'picker-placeholder'}>
                  {provinceIndex >= 0 && province ? province.name : '请选择省'}
                </Text>
                <Text className="picker-arrow">▼</Text>
              </View>
            </Picker>
          </View>

          <View className="region-item">
            <Text className="region-label">市</Text>
            {province ? (
              <Picker
                mode="selector"
                range={cities}
                rangeKey="name"
                value={cityIndex >= 0 ? cityIndex : 0}
                onChange={(e) => {
                  const index = e.detail.value
                  this.setState(
                    {
                      cityIndex: index,
                      districtIndex: 0,
                    },
                    () => {
                      this.triggerChange({ provinceIndex, cityIndex: index, districtIndex: 0 })
                    },
                  )
                }}
              >
                <View className="picker-view">
                  <Text className={cityIndex >= 0 ? 'picker-text' : 'picker-placeholder'}>
                    {cityIndex >= 0 && city ? city.name : '请选择市'}
                  </Text>
                  <Text className="picker-arrow">▼</Text>
                </View>
              </Picker>
            ) : (
              <View className="picker-view picker-view--disabled">
                <Text className="picker-placeholder">请选择省后选择市</Text>
                <Text className="picker-arrow">▼</Text>
              </View>
            )}
          </View>

          <View className="region-item">
            <Text className="region-label">区/县</Text>
            {city ? (
              <Picker
                mode="selector"
                range={districts}
                rangeKey="name"
                value={districtIndex >= 0 ? districtIndex : 0}
                onChange={(e) => {
                  const index = e.detail.value
                  this.setState({ districtIndex: index }, () => {
                    this.triggerChange({ provinceIndex, cityIndex, districtIndex: index })
                  })
                }}
              >
                <View className="picker-view">
                  <Text className={districtIndex >= 0 ? 'picker-text' : 'picker-placeholder'}>
                    {districtIndex >= 0 && city ? districts[districtIndex]?.name : '请选择区/县'}
                  </Text>
                  <Text className="picker-arrow">▼</Text>
                </View>
              </Picker>
            ) : (
              <View className="picker-view picker-view--disabled">
                <Text className="picker-placeholder">请选择市后选择区/县</Text>
                <Text className="picker-arrow">▼</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }
}

