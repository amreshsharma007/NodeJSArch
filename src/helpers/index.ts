export default {
  isValidMobile: (mobile: string | number) => {
    if (!mobile) {
      return false;
    }
    const mobileString = mobile.toString();
    return !!/^\d{10,15}$/.test(mobileString);
  },

  sleep: (seconds: number) => {
    return new Promise(resolve => setTimeout(resolve, seconds));
  },
};
