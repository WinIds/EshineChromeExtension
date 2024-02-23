// follow_button.js
import { getCurrentTabUrl, unfollowProfile, followProfile, getIsCurrentlyFollowed, setIsCurrentlyFollowed, isValidLinkedInProfileUrl, getFollowedProfiles } from './api.js';

async function initializeExtension() {
    const currentUrl = await getCurrentTabUrl();
    if (isValidLinkedInProfileUrl(currentUrl)) {
        const followedProfiles = await getFollowedProfiles();
		let isCurrentlyFollowed = getIsCurrentlyFollowed();
        isCurrentlyFollowed = followedProfiles.includes(currentUrl);
        setFollowButtonState(isCurrentlyFollowed, true);
    }
}

async function updateFollowButton(isInit=false) {
    const currentUrl = await getCurrentTabUrl();
    if (isValidLinkedInProfileUrl(currentUrl)) {
        const followedProfiles = await getFollowedProfiles();
        const isFollowed = followedProfiles.includes(currentUrl);
        setFollowButtonState(isFollowed, isInit);
    }
}

function setFollowButtonState(isFollowed, isInit = false) {
    const followBtn = document.getElementById('follow-btn');
    const followIcon = followBtn.querySelector('.icon-follow');
    const unfollowIcon = followBtn.querySelector('.icon-unfollow');
    const tooltip = followBtn.querySelector('.tooltip-text');

	 
	
    // Update icon visibility
    followIcon.style.display = isFollowed ? 'none' : 'block';
    unfollowIcon.style.display = isFollowed ? 'block' : 'none';
    tooltip.textContent = isFollowed ? 'Unfollow' : 'Follow';

    if (!isInit) {
		// document.queryselectorall('.icon-flag').foreach(flag => {
			 // flag.classlist.toggle('hidden');
		// })
        followBtn.onclick = isFollowed ? unfollowProfile : followProfile;
        // Add animation
        followIcon.classList.add('change');
        unfollowIcon.classList.add('change');
        setTimeout(() => {
            followIcon.classList.remove('change');
            unfollowIcon.classList.remove('change');
        }, 300);
    }
}

// function setFollowButtonState(isFollowed, isInit = false) {
    // const followBtn = document.getElementById('follow-btn');
    // const followIcon = followBtn.querySelector('img');
    // const tooltip = followBtn.querySelector('.tooltip-text');

	
	
	 // // Update global state
    // setIsCurrentlyFollowed(isFollowed);
    // // Set the icon and tooltip text based on follow state
    // tooltip.textContent = isFollowed ? 'Unfollow' : 'Follow';

    // // Only add event listener if not initializing
    // if (!isInit) {
        // followBtn.onclick = isFollowed ? unfollowProfile : followProfile;
        // // Add animation
        // followIcon.classList.add('change');
        // setTimeout(() => followIcon.classList.remove('change'), 300);
    // }
// }

export { updateFollowButton, setFollowButtonState, initializeExtension};
