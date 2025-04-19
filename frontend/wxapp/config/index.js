export const config = {
    /** 是否使用mock代替api返回 */
    useMock: true,
};

export const apiServer = {
    gqlUri: "https://ces.shenzhouyinji.cn/query",
};

function getHeader() {
    const accessToken = wx.getStorageSync('accessToken') || '08607ece48ab64bcad4501ecc339c0a84096b782b01b41ca48632946ea6a95a8';
    return {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Authorization': `Bearer ${accessToken}`,
        'Connection': 'keep-alive',
        'User-Agent': 'PostmanRuntime-ApipostRuntime/1.1.0'
    };

}

export async function useQuery({query, variables, operationName}) {
    return new Promise(function (reslove, reject) {
        wx.request({
            url: apiServer.gqlUri,
            method: 'POST',
            header: getHeader(),
            data: JSON.stringify({
                operationName,
                query,
                variables
            }),

            success(res) {
                const {data, errors} = res.data;
                if (errors && errors.length > 0) {
                    reject(errors[0]);
                    return;
                }
                reslove(data);
            },
            fail(err) {
                reject(err);
            }
        });
    });
}

export async function useMutation({mutation, variables}) {
    return new Promise(function (reslove, reject) {
        wx.request({
            url: apiServer.gqlUri,
            method: 'POST',
            header: getHeader(),
            data: JSON.stringify({query: mutation, variables}),
            success(res) {
                const {data, errors} = res.data;
                if (errors && errors.length > 0) {
                    reject(errors[0]);
                    return;
                }
                reslove(data);
            },
        });
    });
}
