// @flow

import {loadLoginCredentials} from '../../lib/login'
import {type ReduxState} from '../index'
import type {PrintJob, Printer} from '../../lib/stoprint'
import {
	fetchAllPrinters,
	fetchColorPrinters,
	fetchJobs,
	fetchRecentPrinters,
	logIn,
} from '../../lib/stoprint'

type Dispatch<A: Action> = (action: A | Promise<A> | ThunkAction<A>) => any
type GetState = () => ReduxState
type ThunkAction<A: Action> = (dispatch: Dispatch<A>, getState: GetState) => any
type Action = UpdateAllPrintersAction | UpdatePrintJobsAction

const UPDATE_ALL_PRINTERS_START = 'stoprint/UPDATE_ALL_PRINTERS/START'
const UPDATE_ALL_PRINTERS_FAILURE = 'stoprint/UPDATE_ALL_PRINTERS/FAILURE'
const UPDATE_ALL_PRINTERS_SUCCESS = 'stoprint/UPDATE_ALL_PRINTERS/SUCCESS'
const UPDATE_PRINT_JOBS_START = 'stoprint/UPDATE_PRINT_JOBS/START'
const UPDATE_PRINT_JOBS_FAILURE = 'stoprint/UPDATE_PRINT_JOBS/FAILURE'
const UPDATE_PRINT_JOBS_SUCCESS = 'stoprint/UPDATE_PRINT_JOBS/SUCCESS'

type UpdateAllPrintersStartAction = {
	type: 'stoprint/UPDATE_ALL_PRINTERS/START',
}

type UpdateAllPrintersFailureAction = {
	type: 'stoprint/UPDATE_ALL_PRINTERS/FAILURE',
	payload: string,
}

type UpdateAllPrintersSuccessAction = {
	type: 'stoprint/UPDATE_ALL_PRINTERS/SUCCESS',
	payload: {
		allPrinters: Array<Printer>,
		popularPrinters: Array<Printer>,
		recentPrinters: Array<Printer>,
		colorPrinters: Array<Printer>,
	},
}

type UpdateAllPrintersAction =
	| UpdateAllPrintersSuccessAction
	| UpdateAllPrintersFailureAction
	| UpdateAllPrintersStartAction

type UpdatePrintJobsStartAction = {
	type: 'stoprint/UPDATE_PRINT_JOBS/START',
}

type UpdatePrintJobsFailureAction = {
	type: 'stoprint/UPDATE_PRINT_JOBS/FAILURE',
	payload: string,
}

type UpdatePrintJobsSuccessAction = {
	type: 'stoprint/UPDATE_PRINT_JOBS/SUCCESS',
	payload: Array<PrintJob>,
}

type UpdatePrintJobsAction =
	| UpdatePrintJobsSuccessAction
	| UpdatePrintJobsFailureAction
	| UpdatePrintJobsStartAction

export function updatePrinters(): ThunkAction<UpdateAllPrintersAction> {
	return async dispatch => {
		const {username, password} = await loadLoginCredentials()
		if (!username || !password) {
			return false
		}

		dispatch({type: UPDATE_ALL_PRINTERS_START})

		const successMsg = await logIn(username, password)
		if (successMsg !== 'success') {
			return dispatch({type: UPDATE_ALL_PRINTERS_FAILURE, payload: successMsg})
		}

		const [
			allPrintersResponse,
			recentAndPopularPrintersResponse,
			colorPrintersResponse,
		] = await Promise.all([
			fetchAllPrinters(username),
			fetchRecentPrinters(username),
			fetchColorPrinters(),
		])

		if (allPrintersResponse.error) {
			return dispatch({
				type: UPDATE_ALL_PRINTERS_FAILURE,
				payload: allPrintersResponse.value,
			})
		}

		if (recentAndPopularPrintersResponse.error) {
			return dispatch({
				type: UPDATE_ALL_PRINTERS_FAILURE,
				payload: recentAndPopularPrintersResponse.value,
			})
		}

		if (colorPrintersResponse.error) {
			return dispatch({
				type: UPDATE_ALL_PRINTERS_FAILURE,
				payload: colorPrintersResponse.value,
			})
		}

		const {
			recentPrinters,
			popularPrinters,
		} = recentAndPopularPrintersResponse.value
		const allPrinters = allPrintersResponse.value

		const colorPrinters = allPrinters.filter(printer =>
			colorPrintersResponse.value.data.colorPrinters.includes(
				printer.printerName,
			),
		)

		dispatch({
			type: UPDATE_ALL_PRINTERS_SUCCESS,
			payload: {allPrinters, recentPrinters, popularPrinters, colorPrinters},
		})
	}
}

export function updatePrintJobs(): ThunkAction<UpdatePrintJobsAction> {
	return async dispatch => {
		const {username, password} = await loadLoginCredentials()
		if (!username || !password) {
			return false
		}

		dispatch({type: UPDATE_PRINT_JOBS_START})

		const successMsg = await logIn(username, password)
		if (successMsg !== 'success') {
			return dispatch({type: UPDATE_PRINT_JOBS_FAILURE, payload: successMsg})
		}

		const jobsResponse = await fetchJobs(username)

		if (jobsResponse.error) {
			return dispatch({
				type: UPDATE_PRINT_JOBS_FAILURE,
				payload: jobsResponse.value,
			})
		}

		dispatch({
			type: UPDATE_PRINT_JOBS_SUCCESS,
			payload: jobsResponse.value.jobs,
		})
	}
}

export type State = {|
	jobs: Array<PrintJob>,
	printers: Array<Printer>,
	recentPrinters: Array<Printer>, // printer names
	popularPrinters: Array<Printer>, // printer names
	colorPrinters: Array<Printer>,
	jobsError: ?string,
	printersError: ?string,
	loadingPrinters: boolean,
	loadingJobs: boolean,
|}

const initialState: State = {
	jobsError: null,
	printersError: null,
	jobs: [],
	printers: [],
	recentPrinters: [],
	popularPrinters: [],
	colorPrinters: [],
	loadingPrinters: false,
	loadingJobs: false,
}

export function stoprint(state: State = initialState, action: Action) {
	switch (action.type) {
		case UPDATE_PRINT_JOBS_START:
			return {...state, loadingJobs: true}

		case UPDATE_PRINT_JOBS_FAILURE:
			return {...state, loadingJobs: false, jobsError: action.payload}

		case UPDATE_PRINT_JOBS_SUCCESS:
			return {
				...state,
				jobs: action.payload,
				error: null,
				loadingJobs: false,
			}

		case UPDATE_ALL_PRINTERS_START:
			return {...state, loadingPrinters: true}

		case UPDATE_ALL_PRINTERS_FAILURE:
			return {...state, loadingPrinters: false, printersError: action.payload}

		case UPDATE_ALL_PRINTERS_SUCCESS:
			return {
				...state,
				printers: action.payload.allPrinters,
				recentPrinters: action.payload.recentPrinters,
				popularPrinters: action.payload.popularPrinters,
				colorPrinters: action.payload.colorPrinters,
				jobsError: null,
				printersError: null,
				loadingPrinters: false,
			}

		default:
			return state
	}
}
