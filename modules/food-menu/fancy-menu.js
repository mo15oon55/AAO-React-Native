// @flow

import * as React from 'react'
import {StyleSheet, SectionList} from 'react-native'
import * as c from '@frogpond/colors'
import type momentT from 'moment'
import type {
	MenuItemType as MenuItem,
	MasterCorIconMapType,
	ProcessedMealType,
	MenuItemContainerType,
	StationMenuType,
} from './types'
import {type NavigationScreenProp} from 'react-navigation'
import size from 'lodash/size'
import values from 'lodash/values'
import {ListSeparator, ListSectionHeader} from '@frogpond/lists'
import {applyFiltersToItem, type FilterType} from '@frogpond/filter'
import {NoticeView} from '@frogpond/notice'
import {FilterMenuToolbar as FilterToolbar} from './filter-menu-toolbar'
import {FoodItemRow} from './food-item-row'
import {chooseMeal} from './lib/choose-meal'
import {buildFilters} from './lib/build-filters'

type ReactProps = {
	cafeMessage?: ?string,
	foodItems: MenuItemContainerType,
	meals: ProcessedMealType[],
	menuCorIcons: MasterCorIconMapType,
	name: string,
	now: momentT,
	onRefresh?: ?() => any,
	refreshing?: ?boolean,
}

type FilterFunc = (filters: Array<FilterType>, item: MenuItem) => boolean

type DefaultProps = {
	applyFilters: FilterFunc,
	navigation: NavigationScreenProp<*>,
}

type Props = ReactProps & DefaultProps

type State = {
	filters: Array<FilterType>,
	cachedFoodItems: ?MenuItemContainerType,
}

const styles = StyleSheet.create({
	inner: {
		backgroundColor: c.white,
	},
	message: {
		paddingVertical: 16,
	},
})

const LEFT_MARGIN = 28
const Separator = () => <ListSeparator spacing={{left: LEFT_MARGIN}} />

export class FancyMenu extends React.Component<Props, State> {
	static defaultProps = {
		applyFilters: applyFiltersToItem,
	}

	state = {
		filters: [],
		cachedFoodItems: null,
	}

	static getDerivedStateFromProps(props: Props, prevState: State) {
		// we only need to do this when the menu has changed; this avoids
		// us overriding our changes from FilterView.onDismiss
		if (
			!prevState.cachedFoodItems ||
			props.foodItems === prevState.cachedFoodItems
		) {
			let {foodItems, menuCorIcons, meals, now} = props
			let filters = buildFilters(values(foodItems), menuCorIcons, meals, now)
			return {filters, cachedFoodItems: props.foodItems}
		}
		return null
	}

	areSpecialsFiltered = (filters: Array<FilterType>) =>
		Boolean(filters.find(this.isSpecialsFilter))

	isSpecialsFilter = (f: FilterType) =>
		f.enabled && f.type === 'toggle' && f.spec.label === 'Only Show Specials'

	updateFilter = (filter: FilterType) => {
		this.setState(state => {
			let edited = state.filters.map(f => (f.key !== filter.key ? f : filter))
			return {filters: edited}
		})
	}

	onPressRow(item: MenuItem, icons: MasterCorIconMapType) {
		this.props.navigation.navigate('MenuItemDetailView', {
			item,
			icons,
		})
	}

	groupMenuData = (args: {
		filters: Array<FilterType>,
		stations: Array<StationMenuType>,
		foodItems: MenuItemContainerType,
		applyFilters: FilterFunc,
	}) => {
		let {applyFilters, foodItems, stations, filters} = args

		let derefrenceMenuItems = menu =>
			menu.items
				// Dereference each menu item
				.map(id => foodItems[id])
				// Ensure that the referenced menu items exist,
				// and apply the selected filters to the items in the menu
				.filter(item => item && applyFilters(filters, item))

		let menusWithItems = stations
			// We're grouping the menu items in a [label, Array<items>] tuple.
			.map(menu => [menu.label, derefrenceMenuItems(menu)])
			// We only want to show stations with at least one item in them
			.filter(([_, items]) => items.length)
			// We need to map the tuples into objects for SectionList
			.map(([title, data]) => ({title, data}))

		return menusWithItems
	}

	renderSectionHeader = ({section: {title}}: any) => {
		let {now, meals} = this.props
		let {filters} = this.state
		let {stations} = chooseMeal(meals, filters, now)
		let menu = stations.find(m => m.label === title)

		return (
			<ListSectionHeader
				spacing={{left: LEFT_MARGIN}}
				subtitle={menu ? menu.note : ''}
				title={title}
			/>
		)
	}

	renderItem = ({item}: {item: MenuItem}) => {
		let specialsFilterEnabled = this.areSpecialsFiltered(this.state.filters)
		return (
			<FoodItemRow
				badgeSpecials={!specialsFilterEnabled}
				corIcons={this.props.menuCorIcons}
				data={item}
				onPress={() => this.onPressRow(item, this.props.menuCorIcons)}
				spacing={{left: LEFT_MARGIN}}
			/>
		)
	}

	keyExtractor = (item: MenuItem, index: number) => index.toString()

	render() {
		let {now, meals, cafeMessage, applyFilters, foodItems} = this.props
		let {filters} = this.state

		let {label: mealName, stations} = chooseMeal(meals, filters, now)
		let anyFiltersEnabled = filters.some(f => f.enabled)
		let specialsFilterEnabled = this.areSpecialsFiltered(filters)
		let groupedMenuData = this.groupMenuData({
			stations,
			filters,
			applyFilters,
			foodItems,
		})

		let message = 'No items to show.'
		if (cafeMessage) {
			message = cafeMessage
		} else if (specialsFilterEnabled && stations.length === 0) {
			message =
				'No items to show. There may be no specials today. Try changing the filters.'
		} else if (anyFiltersEnabled && !size(groupedMenuData)) {
			message = 'No items to show. Try changing the filters.'
		}

		let messageView = <NoticeView style={styles.message} text={message} />

		let header = (
			<FilterToolbar
				date={now}
				filters={filters}
				onPopoverDismiss={this.updateFilter}
				title={mealName}
			/>
		)

		return (
			<SectionList
				ItemSeparatorComponent={Separator}
				ListEmptyComponent={messageView}
				ListHeaderComponent={header}
				data={filters}
				keyExtractor={this.keyExtractor}
				onRefresh={this.props.onRefresh}
				refreshing={this.props.refreshing}
				renderItem={this.renderItem}
				renderSectionHeader={this.renderSectionHeader}
				sections={(groupedMenuData: any)}
				style={styles.inner}
				windowSize={5}
			/>
		)
	}
}
