import { Component } from 'react'
import { View, Text, Picker } from '@tarojs/components'
import './index.scss'

type RegionValue = {
  province: string
  city: string
  district: string
}

export type RegionChangePayload = RegionValue & { postcode?: string }

type Props = {
  value: RegionValue
  onChange: (value: RegionChangePayload) => void
}

type State = {
  /** 省 / 市 / 区 名称，供 Picker mode=region */
  regionValue: string[]
}

export default class RegionSelector extends Component<Props, State> {
  state: State = {
    regionValue: [],
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
    const { province, city, district } = value
    if (province && city && district) {
      this.setState({ regionValue: [province, city, district] })
    } else {
      this.setState({ regionValue: [] })
    }
  }

  render() {
    const { regionValue } = this.state
    const hasRegion = regionValue.length === 3 && regionValue.every(Boolean)

    return (
      <View className="region-selector">
        <Picker
          mode="region"
          value={hasRegion ? regionValue : []}
          onChange={(e) => {
            const v = (e.detail?.value || []) as string[]
            const province = v[0] || ''
            const city = v[1] || ''
            const district = v[2] || ''
            const detail = e.detail as { value: string[]; postcode?: string }
            const postcode = detail.postcode
            this.setState({ regionValue: v })
            this.props.onChange({
              province,
              city,
              district,
              ...(postcode ? { postcode } : {}),
            })
          }}
        >
          <View className="picker-view">
            <Text className={hasRegion ? 'picker-text' : 'picker-placeholder'}>
              {hasRegion ? `${regionValue[0]} ${regionValue[1]} ${regionValue[2]}` : '请选择省市区'}
            </Text>
            <Text className="picker-arrow">▼</Text>
          </View>
        </Picker>
      </View>
    )
  }
}
