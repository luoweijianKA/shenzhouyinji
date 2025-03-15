import dayjs from 'dayjs';

const ago = (time) => {
  const v = Math.floor(new Date().getTime() / 1000) - time
  if (v < 60) {
    return `${v}秒前`
  }
  if (v < 3600) {
    return `${Math.floor(v / 60)}分钟前`
  }
  if (v < 3600 * 24) {
    return `${Math.floor(v / 3600)}小时前`
  }
  const days = Math.floor(v / (3600 * 24))
  if (days < 7) {
    return `${days}天前`
  }

  const d = new Date(time * 1000)
  const year = `${d.getFullYear()}`
  const month = `${d.getMonth() + 1}`.padStart(2, "0")
  const date = `${d.getDate()}`.padStart(2, "0")

  return `${year}-${month}-${date}`
}

const later = (time) => {
  const v = time * 1000 - new Date().getTime()
  return Math.floor(v / 1000 / 3600 / 24)
}

const formatTime = (date, template) => dayjs(date).format(template);


/**
 * 格式化价格数额为字符串
 * 可对小数部分进行填充，默认不填充
 * @param price 价格数额，以分为单位!
 * @param fill 是否填充小数部分 0-不填充 1-填充第一位小数 2-填充两位小数
 */
function priceFormat(price, fill = 0) {
  if (isNaN(price) || price === null || price === Infinity) {
    return price;
  }

  let priceFormatValue = Math.round(parseFloat(`${price}`) * 10 ** 8) / 10 ** 8; // 恢复精度丢失
  priceFormatValue = `${Math.ceil(priceFormatValue) / 100}`; // 向上取整，单位转换为元，转换为字符串
  if (fill > 0) {
    // 补充小数位数
    if (priceFormatValue.indexOf('.') === -1) {
      priceFormatValue = `${priceFormatValue}.`;
    }
    const n = fill - priceFormatValue.split('.')[1]?.length;
    for (let i = 0; i < n; i++) {
      priceFormatValue = `${priceFormatValue}0`;
    }
  }
  return priceFormatValue;
}

/**
 * 获取cdn裁剪后链接
 *
 * @param {string} url 基础链接
 * @param {number} width 宽度，单位px
 * @param {number} [height] 可选，高度，不填时与width同值
 */
const cosThumb = (url, width, height = width) => {
  if (url.indexOf('?') > -1) {
    return url;
  }

  if (url.indexOf('http://') === 0) {
    url = url.replace('http://', 'https://');
  }

  return `${url}?imageMogr2/thumbnail/${~~width}x${~~height}`;
};

const get = (source, paths, defaultValue) => {
  if (typeof paths === 'string') {
    paths = paths
      .replace(/\[/g, '.')
      .replace(/\]/g, '')
      .split('.')
      .filter(Boolean);
  }
  const { length } = paths;
  let index = 0;
  while (source != null && index < length) {
    source = source[paths[index++]];
  }
  return source === undefined || index === 0 ? defaultValue : source;
};
let systemWidth = 0;
/** 获取系统宽度，为了减少启动消耗所以在函数里边做初始化 */
export const loadSystemWidth = () => {
  if (systemWidth) {
    return systemWidth;
  }

  try {
    ({ screenWidth: systemWidth, pixelRatio } = wx.getSystemInfoSync());
  } catch (e) {
    systemWidth = 0;
  }
  return systemWidth;
};

/**
 * 转换rpx为px
 *
 * @description
 * 什么时候用？
 * - 布局(width: 172rpx)已经写好, 某些组件只接受px作为style或者prop指定
 *
 */
const rpx2px = (rpx, round = false) => {
  loadSystemWidth();

  // px / systemWidth = rpx / 750
  const result = (rpx * systemWidth) / 750;

  if (round) {
    return Math.floor(result);
  }

  return result;
};

/**
 * 手机号码*加密函数
 * @param {string} phone 电话号
 * @returns
 */
const phoneEncryption = (phone) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

// 内置手机号正则字符串
const innerPhoneReg =
  '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$';

/**
 * 手机号正则校验
 * @param phone 手机号
 * @param phoneReg 正则字符串
 * @returns true - 校验通过 false - 校验失败
 */
const phoneRegCheck = (phone) => {
  const phoneRegExp = new RegExp(innerPhoneReg);
  return phoneRegExp.test(phone);
};

const id18 = /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
const id15 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/
const idtest = (v) => {
  return id18.test(v) || id15.test(v)
}

const idcard2age = (v) => {
  var len = (v + "").length
  if (len == 0) {
    return 0
  } else {
    if (len != 15 && len != 18) {
      return 0
    }
  }
  var birthday = ""
  if (len == 18) {
    birthday = v.substr(6, 4) + "/" + v.substr(10, 2) + "/" + v.substr(12, 2)
  }
  if (len == 15) {
    birthday = "19" + v.substr(6, 2) + "/" + v.substr(8, 2) + "/" + v.substr(10, 2)
  }
  var date = new Date(birthday);
  var now = new Date()
  var age = now.getFullYear() - date.getFullYear()
  if (
    now.getMonth() < date.getMonth() ||
    (now.getMonth() == date.getMonth() &&
      now.getDate() < date.getDate())
  ) {
    age--
  }
  return age
}

const validateNickname = (input) => {
  // 检查输入是否为字符串类型
  if (typeof input !== 'string') return false;
  // 正则表达式验证（字母、数字、汉字）
  const nicknamePattern = /^[\w\u4e00-\u9fa5]+$/;

  // 验证长度和字符组成
  return (
    input.length <= 10 &&
    input.length > 0 &&
    nicknamePattern.test(input)
  );
}


module.exports = {
  ago,
  later,
  formatTime,
  priceFormat,
  cosThumb,
  get,
  rpx2px,
  phoneEncryption,
  phoneRegCheck,
  idtest,
  idcard2age,
  validateNickname,
};
