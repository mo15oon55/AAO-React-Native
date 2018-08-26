// @flow
import * as React from 'react'
import {StyleSheet, View, Text, Platform} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import * as c from '@frogpond/colors'
import * as theme from '@app/lib/theme'

const buttonStyles = StyleSheet.create({
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 8,
		paddingHorizontal: 8,
		paddingVertical: 0,
		marginVertical: 8,
		borderWidth: 1,
		borderRadius: 2,
	},
	activeButton: {
		backgroundColor: theme.toolbarButtonBackground,
		borderColor: theme.toolbarButtonBackground,
	},
	inactiveButton: {
		borderColor: c.iosDisabledText,
	},
	activeText: {
		color: theme.toolbarButtonForeground,
	},
	inactiveText: {
		color: c.iosDisabledText,
	},
	textWithIcon: {
		paddingRight: 8,
	},
})

type ButtonPropsType = {
	iconName?: string,
	title: string,
	isActive: boolean,
}

export function ToolbarButton({title, iconName, isActive}: ButtonPropsType) {
	let icon
	if (!iconName) {
		icon = null
	} else if (Platform.OS === 'ios') {
		icon = iconName
	} else if (Platform.OS === 'android') {
		icon = iconName
	}

	let activeButtonStyle = isActive
		? buttonStyles.activeButton
		: buttonStyles.inactiveButton
	let activeContentStyle = isActive
		? buttonStyles.activeText
		: buttonStyles.inactiveText

	let textWithIconStyle = icon ? buttonStyles.textWithIcon : null
	let activeTextStyle = {
		fontWeight: isActive && Platform.OS === 'android' ? 'bold' : 'normal',
	}

	return (
		<View style={[buttonStyles.button, activeButtonStyle]}>
			<Text style={[activeContentStyle, textWithIconStyle, activeTextStyle]}>
				{title}
			</Text>
			{icon ? <Icon name={icon} size={18} style={activeContentStyle} /> : null}
		</View>
	)
}