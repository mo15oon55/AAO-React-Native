// @flow
/**
 * All About Olaf
 * Building Hours list element
 */

import React from 'react'
import {
 View,
 Text,
 Image,
 Dimensions,
 StyleSheet,
} from 'react-native'

import type momentT from 'moment'
import type {BuildingInfoType} from './types'
import * as c from '../components/colors'
import {isBuildingOpen} from './is-building-open'
import {formatBuildingHours} from './format-building-hours'
import CollapsibleBlock from '../components/collapsibleBlock'
import {allBuildingHours} from './all-building-hours.js'

type PropsType = {
  info: BuildingInfoType,
  image: number,
  name: string,
  now: momentT,
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    marginTop: 10,
    height: 100,
  },
  name: {
    color: c.white,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  inner: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  status: {
    color: c.white,
    fontSize: 14,
    paddingTop: 2,
    paddingBottom: 2,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  hoursText: {
    textAlign: 'center',
    fontSize: 13,
  },
  contents: {
    paddingBottom: 10,
    paddingTop: 5,
  },
})


export function BuildingView({info, image, name, now}: PropsType) {
  let borderColors = {
    'Open': '#CEFFCE',
    'Almost Closed': '#FFFC96',
    'Closed': '#F7C8C8',
  }

  const openStatus = isBuildingOpen(info, now)
  const hours = formatBuildingHours(info, now)
  const allHours = allBuildingHours(info, now)
  const allHoursAsElements = allHours.map((time, i) =>
    <Text key={i} style={styles.hoursText}>{time}</Text>)

  return (
    <CollapsibleBlock style={styles} collapsedStyle={{backgroundColor: borderColors[openStatus]}}>
      <View style={[styles.container, {borderColor: borderColors[openStatus]}]}>
        <Image
          source={image}
          style={{width: undefined, height: 100}}
          resizeMode='cover'
        >
          <View style={styles.inner}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.status}>{hours}</Text>
          </View>
        </Image>
      </View>

      <View style={[styles.contents, {width: Dimensions.get('window').width}]}>
        <Text style={styles.hoursText}>Daily Hours</Text>
        {allHoursAsElements}
      </View>
    </CollapsibleBlock>
  )
}

BuildingView.propTypes = {
  image: React.PropTypes.number.isRequired,
  info: React.PropTypes.object.isRequired,
  name: React.PropTypes.string.isRequired,
  now: React.PropTypes.object.isRequired,
}
