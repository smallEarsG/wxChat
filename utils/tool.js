	export function isMemberExpired(guestInfo) {
		console.log("guestInfo",guestInfo);
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