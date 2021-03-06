// @flow

import {getTermInfo} from '../../../../lib/storage'
import {parseTerm} from '../../../../lib/course-search/parse-term'
import type {FilterType} from '@frogpond/filter'
import {loadAllCourseFilterOptions} from '../../../../lib/course-search'

export async function buildFilters(): Promise<FilterType[]> {
	const terms = await getTermInfo()
	const allTerms = terms
		.map(term => ({
			title: term.term,
			label: parseTerm(term.term.toString()),
		}))
		.reverse()

	const {ges, departments} = await loadAllCourseFilterOptions()

	const allGEs = ges.map(ge => ({title: ge}))
	const allDepartments = departments.map(dep => ({title: dep}))
	const courseLevelOptions = [{title: 100}, {title: 200}, {title: 300}]

	return [
		{
			type: 'toggle',
			key: 'spaceAvailable',
			enabled: false,
			spec: {
				label: 'Space Available',
				title: 'Enrollment',
				caption: 'When activated, shows only courses with space available.',
			},
			apply: {
				key: 'spaceAvailable',
			},
		},
		{
			type: 'list',
			key: 'term',
			enabled: false,
			spec: {
				title: 'Terms',
				options: allTerms,
				mode: 'OR',
				selected: allTerms,
				displayTitle: false,
			},
			apply: {
				key: 'term',
			},
		},
		{
			type: 'list',
			key: 'gereqs',
			enabled: false,
			spec: {
				title: 'GEs',
				showImages: false,
				options: allGEs,
				mode: 'AND',
				selected: [],
				displayTitle: true,
			},
			apply: {
				key: 'gereqs',
			},
		},
		{
			type: 'list',
			key: 'department',
			enabled: false,
			spec: {
				title: 'Department',
				showImages: false,
				options: allDepartments,
				mode: 'OR',
				selected: allDepartments,
				displayTitle: true,
			},
			apply: {
				key: 'department',
			},
		},
		{
			type: 'list',
			key: 'level',
			enabled: false,
			spec: {
				title: 'Level',
				showImages: false,
				options: courseLevelOptions,
				mode: 'OR',
				selected: courseLevelOptions,
				displayTitle: true,
			},
			apply: {
				key: 'level',
			},
		},
		{
			type: 'toggle',
			key: 'status',
			enabled: false,
			spec: {
				label: 'Open Courses',
				title: 'Status',
				caption:
					'Allows you to either see only courses that are open, or all courses.',
			},
			apply: {
				key: 'status',
				trueEquivalent: 'O',
			},
		},
		{
			type: 'toggle',
			key: 'type',
			enabled: false,
			spec: {
				label: 'Lab Only',
				title: 'Lab',
				caption: 'Allows you to only see labs.',
			},
			apply: {
				key: 'type',
				trueEquivalent: 'Lab',
			},
		},
	]
}
