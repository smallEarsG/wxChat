export const CUSTOMER_STATS_EVENT = 'customerOverviewChanged';

const CARDS_STORAGE_KEY = 'curDataCards';
const LEGACY_STORAGE_KEY = 'workbenchData';
const DEFAULT_STATS = {
	totalCustomers: 6,
	todayNewCustomers: 0,
	todayIncome: '6.00'
};
const LEGACY_FIELDS = {
	totalCustomers: 't1',
	todayNewCustomers: 't2',
	todayIncome: 't3'
};
const DETAIL_FIELDS = ['dashboardTitle', 'dashboardDesc', 'showMoreAdd'];

function isRecord(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readRecord(key) {
	try {
		const value = uni.getStorageSync(key);
		return isRecord(value) ? value : {};
	} catch (error) {
		return {};
	}
}

function isValidCount(value) {
	if (typeof value !== 'number' && typeof value !== 'string') return false;
	if (typeof value === 'string' && !value.trim()) return false;
	return Number.isFinite(Number(value));
}

function isValidIncome(value) {
	return typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
}

function normalizeIncome(value) {
	const text = String(value).trim();
	if (!text) return '0.00';
	const number = Number(text);
	return Number.isFinite(number) ? number.toFixed(2) : text;
}

function resolveStats(overview, legacy) {
	const stats = {};
	Object.keys(DEFAULT_STATS).forEach((key) => {
		const isValid = key === 'todayIncome' ? isValidIncome : isValidCount;
		const primary = overview[key];
		const previous = legacy[LEGACY_FIELDS[key]];
		const value = isValid(primary) ? primary : (isValid(previous) ? previous : DEFAULT_STATS[key]);
		stats[key] = key === 'todayIncome' ? normalizeIncome(value) : Number(value);
	});
	return stats;
}

export function getCustomerStats() {
	const cards = readRecord(CARDS_STORAGE_KEY);
	const overview = isRecord(cards.overview) ? cards.overview : {};
	return resolveStats(overview, readRecord(LEGACY_STORAGE_KEY));
}

export function saveCustomerStats(values, overviewDetails = {}) {
	// 保存前读取失败时直接抛出，避免用空对象覆盖尚未读到的其他卡片数据。
	const stored = uni.getStorageSync(CARDS_STORAGE_KEY);
	const cards = isRecord(stored) ? stored : {};
	const overview = isRecord(cards.overview) ? cards.overview : {};
	const stats = resolveStats(overview, readRecord(LEGACY_STORAGE_KEY));
	const incoming = isRecord(values) ? values : {};
	Object.keys(DEFAULT_STATS).forEach((key) => {
		const isValid = key === 'todayIncome' ? isValidIncome : isValidCount;
		if (!Object.prototype.hasOwnProperty.call(incoming, key) || !isValid(incoming[key])) return;
		stats[key] = key === 'todayIncome' ? normalizeIncome(incoming[key]) : Number(incoming[key]);
	});
	const details = {};
	if (isRecord(overviewDetails)) {
		DETAIL_FIELDS.forEach((key) => {
			if (Object.prototype.hasOwnProperty.call(overviewDetails, key)) details[key] = overviewDetails[key];
		});
	}
	uni.setStorageSync(CARDS_STORAGE_KEY, {
		...cards,
		overview: { ...overview, ...details, ...stats }
	});
	if (typeof uni.$emit === 'function') uni.$emit(CUSTOMER_STATS_EVENT, { ...stats });
	return stats;
}
