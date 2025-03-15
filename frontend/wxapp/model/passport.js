import { useQuery } from '../config/index'

export async function getPassport(id) {
  const data = await useQuery({
    query: `query GetUserPassport($id: String!) {
      userPassport(id: $id) {
        id
        user_id
        event_id
        passport_code
        real_name
        nric
        phone
        gender
        profession
        claim_code
        guardian_name
        guardian_nric
        guardian_phone
        claim_time
        status
      }
    }`,
    variables: { id },
  })

  return data.userPassport
}

export async function getPassportByCode(code) {
  const data = await useQuery({
    query: `query GetPassportByCode($code:String!) {
      passportByCode(code:$code) {
        id
        event_id
        code
        status
      }
    }`,
    variables: { code },
  })

  return data.passportByCode
}

export async function createUserPassport(input) {
  const data = await useQuery({
    query: `mutation CreateUserPassport($input: NewUserPassport!) {
      createUserPassport(input: $input) {
        id
      }
    }`,
    variables: { input },
  })

  return data.createUserPassport
}

export async function activatePassport(input) {
  const data = await useQuery({
    query: `mutation ActivateUserEventPassport($input: NewActivateUserEventPassport!) {
      activateUserEventPassport(input: $input)
    }`,
    variables: { input },
  })

  return data.activateUserEventPassport
}