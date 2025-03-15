import { apiServer, useQuery } from '../config/index';

async function getSceneryspotsByIDs(ids) {
  return new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: JSON.stringify({
        query: `query sceneryspots($ids:[String!]!){
          sceneryspotsByIDs(ids:$ids){
            id,
            code,
            name,
            images
          }
        }`,
        variables: {
          "ids": ids
        },
      }),
      success(res) {
        reslove(res.data.data.sceneryspotsByIDs);
      },
    });
  });
}

export async function genSceneryspotsByIDs(ids) {
  let result = await getSceneryspotsByIDs(ids);
  return result;
}

export async function getSceneryspot(id) {
  const data = await useQuery({
    query: `query GetSceneryspot($id: String!) {
      sceneryspot(id: $id) {
        id
        name
        address
        points
        images
        coordinate
        electric_fence
        position_tolerance
        introduction
        category_id
      }
    }`,
    variables: { id },
  })

  return data.sceneryspot
}

export async function getSceneryspots(ids) {
  const data = await useQuery({
    query: `query GetSceneryspots($ids:[String!]!) {
      sceneryspotsByIDs(ids: $ids) {
        id
        code
        name
        introduction
        coordinate
        images
        electric_fence
        position_tolerance
      }
    }`,
    variables: { ids },
  })

  return data.sceneryspotsByIDs
}

export async function getNavigations(sceneryspotId) {
  const data = await useQuery({
    query: `query GetServiceItems($sceneryspotId: String!) {
      serviceItems(sceneryspot_id: $sceneryspotId) {
        id
        name
        category_id
        address
        images
        coordinate
        wxappid
        display_order
        expense_instruction
      }
    }`,
    variables: { sceneryspotId },
  })

  return data.serviceItems
}

export async function getServiceItemsWithCategory(sceneryspotId, categoryId) {
  const data = await useQuery({
    query: `query GetServiceItemsWithCategory($sceneryspotId: String!, $categoryId: String!) {
      serviceItemsWithCategory(sceneryspot_id: $sceneryspotId, category_id: $categoryId) {
        id
        name
        category_id
        address
        images
        coordinate
        wxappid
        display_order
        expense_instruction
      }
    }`,
    variables: { sceneryspotId, categoryId },
  })

  return data.serviceItemsWithCategory
}

export async function getServiceItem(id) {
  const data = await useQuery({
    query: `query GetServiceItem($id: String!) {
      serviceItem(id: $id) {
        id
        sceneryspot_id
        name
        category_id
        address
        images
        coordinate
        wxappid
        display_order
        introduction
        expense_instruction
      }
    }`,
    variables: { id },
  })

  return data.serviceItem
}

export async function getServiceItems(id) {
  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: JSON.stringify({
        query: `query getServiceItems($id: String!) {
          serviceItems(sceneryspot_id: $id) {
            id
            name
            images
            address
            coordinate
            wxappid
            introduction
            expense_instruction
          }
        }`,
        variables: {
          "id": id
        },
      }),
      success(res) {
        reslove(res.data.data.serviceItems);
      },
    });
  });
  return data;
}