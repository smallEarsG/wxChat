export const CUSTOM_TEMPLATE_META_KEY = '__customTemplate'
export const CUSTOM_TEMPLATE_META_VERSION = 1

function isPlainObject(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function clone(value) {
	if (!isPlainObject(value) && !Array.isArray(value)) return value
	return JSON.parse(JSON.stringify(value))
}

function normalizeId(value) {
	return value === undefined || value === null || value === '' ? '' : String(value)
}

export function serializeCustomBillDetail(info, template = {}) {
	const detail = isPlainObject(info) ? clone(info) : {}
	delete detail[CUSTOM_TEMPLATE_META_KEY]

	const metadata = {
		version: CUSTOM_TEMPLATE_META_VERSION,
		id: normalizeId(template.id),
		name: template.name ? String(template.name) : '',
		config: isPlainObject(template.config) ? clone(template.config) : null
	}

	return JSON.stringify({
		...detail,
		[CUSTOM_TEMPLATE_META_KEY]: metadata
	})
}

export function parseCustomBillDetail(rawDetail) {
	let detail = rawDetail
	if (typeof rawDetail === 'string') {
		detail = rawDetail ? JSON.parse(rawDetail) : {}
	}
	if (!isPlainObject(detail)) detail = {}

	const metadata = isPlainObject(detail[CUSTOM_TEMPLATE_META_KEY])
		? detail[CUSTOM_TEMPLATE_META_KEY]
		: {}
	const info = { ...detail }
	delete info[CUSTOM_TEMPLATE_META_KEY]
	delete info.templateId
	delete info.templateName
	delete info.templateConfig

	return {
		info,
		templateId: normalizeId(metadata.id || metadata.templateId || detail.templateId),
		templateName: metadata.name || detail.templateName
			? String(metadata.name || detail.templateName)
			: '',
		templateConfig: isPlainObject(metadata.config)
			? clone(metadata.config)
			: (isPlainObject(detail.templateConfig) ? clone(detail.templateConfig) : null)
	}
}
