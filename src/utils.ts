export type Rank =
    'Newbie'
    | 'Novice'
    | 'Rookie'
    | 'Beginner'
    | 'Talented'
    | 'Skilled'
    | 'Intermediate'
    | 'Skillful'
    | 'Seasoned'
    | 'Proficient'
    | 'Experienced'
    | 'Advanced'
    | 'Senior'
    | 'Expert';

export enum RANK {
    'Newbie',
    'Novice',
    'Rookie',
    'Beginner',
    'Talented',
    'Skilled',
    'Intermediate',
    'Skillful',
    'Seasoned',
    'Proficient',
    'Experienced',
    'Advanced',
    'Senior',
    'Expert',
}

export type Responsibility = 
    'None'
    | 'SecurityOfficer'
    | 'HR';

export enum RESPONSIBILITY {
  'None',
  'SecurityOfficer',
  'HR',
}

export function filterObjectByKeys(object: Object, allowedKeys: string[]): Object {
  const filtered = Object.keys(object)
  .filter(key => allowedKeys.includes(key))
  .reduce(
    (obj, key) => {
      obj[key] = object[key];
      return obj;
    }, 
    {});
  return filtered;
}
