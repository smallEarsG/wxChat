export const SIDEBAR_DATA_KEY = 'chatListSidebarData';
export const ENTERPRISE_INFO_KEY = 'enterpriseInfoVerifiedData';

function isRecord(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function companyName(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function validEnterprises(values) {
	return values.filter(item => isRecord(item) && typeof item.id === 'string' && typeof item.name === 'string');
}

export function getActiveSidebarCompany(sidebar) {
	if (!isRecord(sidebar) || !Array.isArray(sidebar.enterprises)) return null;
	const enterprises = validEnterprises(sidebar.enterprises);
	return enterprises.find(item => item.id === sidebar.activeEnterpriseId) || enterprises[0] || null;
}

export function resolveSidebarCompanyData(current, saved, enterpriseInfo) {
	const hasSaved = isRecord(saved);
	const values = hasSaved ? saved : {};
	const hasSavedEnterprises = Array.isArray(values.enterprises);
	const profile = { ...current.profile, ...(isRecord(values.profile) ? values.profile : {}) };
	const enterprises = validEnterprises(hasSavedEnterprises ? values.enterprises : current.enterprises).map(item => ({ ...item }));
	const active = enterprises.find(item => item.id === values.activeEnterpriseId)
		|| (!hasSavedEnterprises && enterprises.find(item => item.id === current.activeEnterpriseId)) || enterprises[0];
	if (active) {
		let name = companyName(active.name);
		// 已有企业列表优先，首次使用侧栏时再承接企业信息中保存的名称。
		if (!hasSaved && isRecord(enterpriseInfo)) name = companyName(enterpriseInfo.shortName) || name;
		else if (!hasSavedEnterprises) name = companyName(profile.companyName) || name;
		active.name = name;
		profile.companyName = name;
	} else {
		profile.companyName = '';
	}
	return { profile, enterprises, activeEnterpriseId: active ? active.id : '' };
}

export function saveEnterpriseInfoWithCompany(values, companyId) {
	const previousInfo = uni.getStorageSync(ENTERPRISE_INFO_KEY);
	const sidebar = uni.getStorageSync(SIDEBAR_DATA_KEY);
	const target = companyId && isRecord(sidebar) && Array.isArray(sidebar.enterprises)
		? validEnterprises(sidebar.enterprises).find(item => item.id === companyId) : null;
	let nextSidebar = null;
	if (target) {
		const name = companyName(values.shortName);
		const active = getActiveSidebarCompany(sidebar);
		nextSidebar = {
			...sidebar,
			enterprises: sidebar.enterprises.map(item => item && item.id === companyId ? { ...item, name } : item),
			profile: active && active.id === companyId ? { ...sidebar.profile, companyName: name } : sidebar.profile
		};
	}
	uni.setStorageSync(ENTERPRISE_INFO_KEY, values);
	if (nextSidebar) {
		try {
			uni.setStorageSync(SIDEBAR_DATA_KEY, nextSidebar);
		} catch (error) {
			// 两份资料均保存成功才结束编辑，失败时恢复企业信息原值。
			if (previousInfo === '' || previousInfo == null) uni.removeStorageSync(ENTERPRISE_INFO_KEY);
			else uni.setStorageSync(ENTERPRISE_INFO_KEY, previousInfo);
			throw error;
		}
	}
}
