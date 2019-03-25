// @flow

import * as React from 'react'
import {Padding, Text, SectionHeading} from './parts'

export const Plot = ({text, ...props}: {text: string}) => {
	return (
		<>
			<SectionHeading>PLOT</SectionHeading>
			<Padding marginTop={4} {...props}>
				<Text>{text}</Text>
			</Padding>
		</>
	)
}
