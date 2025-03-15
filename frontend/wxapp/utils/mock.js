/**
 * 随机打散字符串
 * @param {number} n 长度
 * @param {string} str 字符串
 * @returns
 */
function generateMixed(n, str) {
  var res = '';
  for (var i = 0; i < n; i++) {
    var id = Math.ceil(Math.random() * 35);
    res += str[id];
  }
  return res;
}

/**
 * 生成随机数
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns
 */
function getRandomNum(min, max) {
  var range = max - min;
  var rand = Math.random();
  return min + Math.round(rand * range);
}

/**
 * 生成随机IP
 * @returns
 */
function mockIp() {
  return `10.${getRandomNum(1, 254)}.${getRandomNum(1, 254)}.${getRandomNum(
    1,
    254,
  )}`;
}

function mockReqId() {
  return `${getRandomNum(100000, 999999)}.${new Date().valueOf()}${getRandomNum(
    1000,
    9999,
  )}.${getRandomNum(10000000, 99999999)}`;
}

const users = [
  '犬声色马',
  '万世浮华',
  '我本凡尘',
  '无可奈何',
  '主播',
  '干的漂亮',
  '早',
  '贺电',
  '爱看的走开'
]

const honours = ['草', '羊', '狼']
const camps = ['艺', '仁', '勇', '智']
const getRandom = (max = 10, min = 0) => Math.floor(Math.random() * (max - min) + min)

const mockUserRankings = (num) => {
  const data = []
  for (let i = 0; i < num; i++) {
    const userId = getRandom(users.length)
    const honourId = getRandom(honours.length)
    const campId = getRandom(camps.length)
    data.push({
      rank: i + 1,
      name: users[userId],
      trip_count: getRandom(50, 1),
      honour_name: honours[honourId],
      camp_name: camps[campId],
      points: getRandom(100, 1),
    })
  }
  return data
}

module.exports = {
  generateMixed,
  mockIp,
  mockReqId,
  getRandomNum,
  mockUserRankings,
};
