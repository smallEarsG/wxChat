export function isMemberExpired(guestInfo) {
	console.log("guestInfo", guestInfo);
	const memberExpireAt = guestInfo.memberExpireAt;
	if (memberExpireAt === '--') {
		return false;
	}
	if (memberExpireAt === null) {
		return true;
	}
	const currentTime = new Date().getTime();
	const expireTime = new Date(memberExpireAt).getTime();
	return expireTime < currentTime;
}
export function getUUid() {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
}