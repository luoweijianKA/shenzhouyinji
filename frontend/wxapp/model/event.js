import { apiServer, useQuery, useMutation } from '../config/index';

export async function getEventCategories() {
  const data = await useQuery({
    query: `query GetCategories {
      categoriesByParentID(id: "774496be-227a-11ef-a7c1-e43d1ad7d220") {
        id
        name
        status
        sort
      }
    }`,
    variables: {},
  })

  return data.categoriesByParentID
}

async function getEvents() {
  return new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: JSON.stringify({
        query: `query events{
          events{
            id,
            name,
            start_time,
            end_time,
            introduction,
            images,
            step,
            status,
            create_time,
            category_id,
            scenerySpots{
              event_id,
              scenery_spot_id
            }
          }
        }`,
      }),
      success(res) {
        reslove(res.data.data.events);
      },
    });
  });
}

export async function genEventList() {
  let result = await getEvents();
  return result.filter(e => e.status === 1);
}

async function getEventSceneryspots(eventId) {
  return new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: JSON.stringify({
        query: `query eventSceneryspots($event_id:String!){
          eventSceneryspots(event_id:$event_id){
            scenery_spot_id
          }
        }`,
        variables: {
          "event_id": eventId
        },
      }),
      success(res) {
        reslove(res.data.data.eventSceneryspots);
      },
    });
  });
}

export async function genEventSceneryspots(eventId) {
  let result = await getEventSceneryspots(eventId);
  return result;
}

export async function getEventPassport(eventId, userId, phone) {
  const data = await useQuery({
    query: `query GetEventPassport($eventId: ID!, $userId: ID!, $phone: String!) {
      eventPassport(eventId: $eventId, userId: $userId, phone: $phone) {
        id
        code
        userId
        eventId
        name
        nric
        phone
        gender
        profession
        claimCode
        claimTime
        guardianName
        guardianNric
        guardianPhone
        status
        camp {
          camp_id
          honour
        }
      }
    }`,
    variables: { eventId, userId, phone },
  })

  return data.eventPassport
}

export async function checkUserEventPassport(input) {
  const data = await useQuery({
    query: `mutation CheckUserEventPassport($input: NewUserEventPassport!) {
      checkUserEventPassport(input: $input) {
        succed
        message
      }
    }`,
    variables: { input },
  })

  return data.checkUserEventPassport
}

export async function createEventPassport(input) {
  const data = await useQuery({
    query: `mutation CreateUserEventPassport($input: NewUserEventPassport!) {
      createUserEventPassport(input: $input)
    }`,
    variables: { input },
  })

  return data.createUserEventPassport
}

export async function getEvent(id) {
  const data = await useQuery({
    query: `query GetEvent($id: String!) {
      event(id: $id) {
        id
        name
        start_time
        end_time
        introduction
        images
        step
        status
        create_time
      }
    }`,
    variables: { id },
  })

  return data.event
}


export async function getEventSettings(id) {
  const data = await useQuery({
    query: `query GetEventSettings($id: ID!) {
      eventSettings(id: $id)
    }`,
    variables: { id },
  })

  return data.eventSettings
}

export async function getEventCamps(eventId) {
  const data = await useQuery({
    query: `query GetEventCamps($eventId: String!) {
      camps(event_id: $eventId) {
        id
        name
        introduction
      }
    }`,
    variables: { eventId },
  })

  return data.camps
}

export async function createUserCamp(input) {
  const data = await useMutation({
    mutation: `mutation CreateUserCamp($input: NewUserCamp!) {
      createUserCamp(input: $input) {
        id
      }
    }`,
    variables: { input },
  })

  return data.createUserCamp
}

export async function getUserCampAndHonour(campId, honourId) {
  const data = await useQuery({
    query: `query GetUserCampAndHonour($campId: String!, $honourId: String!) {
      camp(id: $campId) {
        id
        name
      }
      honour(id: $honourId) {
        id
        name
      }
    }`,
    variables: { campId, honourId },
  })

  return data
}

export async function getTasks(user_id, event_id, camp_id, sceneryspot_id) {
  const data = await useQuery({
    query: `query GetTasks($user_id: ID!, $event_id: ID!, $camp_id:ID!, $sceneryspot_id: ID!) {
      tasks(user_id: $user_id, event_id: $event_id, camp_id: $camp_id, sceneryspot_id: $sceneryspot_id) {
        id
        name
        category_id
        category_name
        points
        optional
        status
        timestamp
        completed
      }
    }`,
    variables: { user_id, event_id, camp_id, sceneryspot_id },
  })

  return data.tasks
}


export async function getTemporaryTasks(user_id, event_id, camp_id) {
  const data = await useQuery({
    query: `query GetTemporaryTasks($user_id: ID!, $event_id: ID!, $camp_id: ID!) {
      temporaryTasks(user_id: $user_id, event_id: $event_id, camp_id: $camp_id) {
        id
        name
        category_id
        category_name
        points
        optional
        status
        timestamp
        completed
      }
    }`,
    variables: { user_id, event_id, camp_id },
  })

  return data.temporaryTasks
}

export async function getTask(id, category_id, user_id, event_id, camp_id, sceneryspot_id) {
  const data = await useQuery({
    query: `query GetTask($id: ID!, $category_id: ID!, $user_id: ID!, $event_id: ID!, $camp_id: ID!, $sceneryspot_id: ID!) {
      task(
        id: $id
        category_id: $category_id
        event_id: $event_id
        user_id: $user_id
        camp_id: $camp_id
        sceneryspot_id: $sceneryspot_id
      ) {
        id
        name
        category_id
        category_name
        points
        optional
        status
        timestamp
        redone
        completed
        electric_fence
        ... on TrekTask {
          step
          images
          introduction
        }
        ... on QuestionTask {
          options
        }
        ... on GeocachingTask {
          images
          introduction
        }
        ... on ScreenshotTask {
          images
          introduction
        }
        ... on PuzzleTask {
          level
          countdown
          puzzles
          introduction
        }
      }
    }`,
    variables: { id, category_id, user_id, event_id, camp_id, sceneryspot_id },
  })

  return data.task
}

export async function getUserTask(user_id, task_id) {
  const data = await useQuery({
    query: `query GetUserTaskByTaskId($user_id: String!) {
      userTaskByUserID(user_id: $user_id) {
        user_id
        task_id
        result
        points
        status
        audit
      }
    }`,
    variables: { user_id },
  })
  const result = data.userTaskByUserID.filter(v => v.task_id === task_id)

  return result.length > 0 ? result[0] : null
}

export async function createUserTask(input) {
  const data = await useMutation({
    mutation: `mutation CreateUserTask($input: NewUserTask!) {
      createUserTask(input: $input) {
        id
        result
        status
        audit
      }
    }`,
    variables: { input },
  })

  return data.createUserTask
}

export async function completeUserTask(input) {
  const data = await useMutation({
    mutation: `mutation CompleteUserTask($input: NewUserTask!) {
      completeUserTask(input: $input) {
        id
        result
        status
        audit
      }
    }`,
    variables: { input },
  })

  return data.completeUserTask
}

export async function getRanks(eventId) {
  const data = await useQuery({
    query: `query GetRanks($eventId: String!) {
      campRanks(eventId: $eventId) {
        rank
        id
        name
        points
        logo
        user_count
      }
      userRanks(eventId: $eventId) {
        rank
        id
        name
        points
        trip_count
        honour_id
        honour_name
        camp_id
        camp_name
      }
    }`,
    variables: { eventId },
  })

  return data
}

export async function getUserEvents(userId, eventId, status) {
  const data = await useQuery({
    query: `query GetUserEvents($userId: String!, $eventId: String, $status: Int) {
      userEvents(userId: $userId, eventId: $eventId, status: $status) {
        id
        name
        images
        start_time
        end_time
        status
        passport_code
        camp_id
        camp_name
        camp_points
        camp_ranking
        user_points
        user_ranking
        user_honour
      }
    }`,
    variables: { userId, eventId, status },
  })

  return data.userEvents
}
