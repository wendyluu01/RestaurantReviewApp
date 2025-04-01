"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attributes = void 0;
const models_1 = __importDefault(require("../models"));
const Seq = models_1.default.Sequelize;
const attributes = {
    userId: [[Seq.literal('DISTINCT ON ("users"."id") "users"."id"'), 'userId']],
    uuid: [[Seq.literal('DISTINCT ON ("users"."id") "users"."uuid"'), 'uuid']],
    default: [
        // 'uuid',
        [Seq.literal('DISTINCT ON ("users"."id") "users"."uuid"'), 'uuid'],
        // 'firstName',
        // 'lastName',
        [Seq.literal('CONCAT("lastName", ' + "'O'" + ', RIGHT("firstName", - 1))'), 'name'],
        'email',
        'phone'
    ],
    info: [
        'uuid',
        [Seq.literal('CONCAT("lastName", "firstName")'), 'name'],
        [Seq.literal('"nickname"."nickname"'), 'nickname'],
        [Seq.literal('"avatar"."url"'), 'avatar'],
        [Seq.literal('array_agg(roles.role)'), 'roles'],
        'email',
        'phone'
    ],
    address: [
        [Seq.col('address.address'), 'address'],
        [Seq.col('address.address2'), 'address2'],
        [Seq.col('address.state'), 'stateCode'],
        [Seq.col('address.states.description'), 'state'],
        [Seq.col('address.city'), 'cityCode'],
        [Seq.col('address.cities.description'), 'city'],
        [Seq.col('address.zip'), 'zip']
    ],
    avatar: [[Seq.col('avatar.url'), 'avatar']],
    salary: [[Seq.literal('Max(salary.salary)'), 'salary']],
    gender: [
        [
            Seq.literal('CASE WHEN "gender"."gender" > 0 THEN "gender->gender_type"."description" ELSE ' +
                "'없음'" +
                ' END'),
            'gender'
        ]
    ],
    computer_certification: [
        [
            Seq.literal('CASE WHEN "computer_certification"."certification" > 0 THEN "computer_certification->computer_certification_type"."description" ELSE ' +
                "'없음'" +
                ' END'),
            'computer_certification'
        ]
    ],
    computer: [
        [
            Seq.literal('CASE WHEN "computer"."computer" > 0 THEN "computer->computer_type"."description" ELSE ' +
                "'없음'" +
                ' END'),
            'computer'
        ]
    ],
    training: [
        [
            Seq.literal('CASE WHEN "training"."training" > 0 THEN "training->training_type"."description" ELSE ' +
                "'없음'" +
                ' END'),
            'training'
        ]
    ],
    work: [
        [
            Seq.literal('CASE WHEN "work"."experience" > 0 THEN "work->experience_type"."description" ELSE ' +
                "'없음'" +
                ' END'),
            'work_experience'
        ]
    ],
    vulnerable: [
        // [Seq.col('vulnerable.type'), 'vulnerable'],
        // [Seq.literal('(json_object_agg("vulnerable"."type", "vulnerable->vulnerable_type"."description"))'), 'vulnerableType'],
        [
            Seq.literal('CASE WHEN "vulnerable"."type" > 0 THEN "vulnerable->vulnerable_type"."description" ELSE ' +
                "'없음'" +
                ' END'),
            'vulnerable'
        ]
    ],
    handicap: [
        // [Seq.col('handicap.type'), 'handicap_type'],
        // [Seq.col('handicap.weight'), 'handicap_weight'],
        // [Seq.literal('(json_object_agg("handicap"."type", "handicap->handicap_type"."description"))'), 'handicapType'],
        [
            Seq.literal('CASE WHEN "handicap"."type" > 0 THEN concat("handicap->handicap_type"."description", ' +
                "'/'" +
                ', "handicap->handicap_weight"."description") ELSE ' +
                "'없음'" +
                ' END'),
            'handicap'
        ]
        // [Seq.literal('(json_object_agg("handicap"."weight", "handicap->handicap_weight"."description"))'), 'handicapWeight'],
        // [Seq.literal('(json_object_agg((CASE WHEN "handicap"."weight" > 0 THEN "handicap"."weight" ELSE 0 END), (CASE WHEN "handicap"."weight" > 0 THEN "handicap->handicap_weight"."description" ELSE ' + "'None'" + ' END)))'), 'handicapWeights'],
    ],
    skills: [
        // [Seq.literal('(json_object_agg("user_skills"."skill", "user_skills->skills"."description"))'), 'skills'],
        [
            Seq.literal('(json_object_agg((CASE WHEN "user_skills"."skill" > 0 THEN "user_skills"."skill" ELSE 0 END), (CASE WHEN "user_skills"."skill" > 0 THEN "user_skills->skills"."description" ELSE ' +
                "'없음'" +
                ' END)))'),
            'skills'
        ]
    ],
    careers: [
        [
            Seq.literal(`CASE WHEN "careers"."userId" > 0 THEN array_agg(json_build_object('company', "careers"."company", 'position', "careers"."position", 'title', "careers"."title", 'details', "careers"."details", 'pay', "careers"."pay", 'start', "careers"."start", 'end', "careers"."end")) END`),
            'careers'
        ]
    ],
    age: [
        // [Seq.col('age.dob'), 'age'],
        // [Seq.fn('DATE_PART', 'year', Seq.fn('age', Seq.fn('max', Seq.col('age.dob')))), 'age'],
        [
            Seq.literal('CASE WHEN date_part(' +
                "'year'" +
                ', age("age"."dob")) < 20 THEN ' +
                "'10대'" +
                ' WHEN date_part(' +
                "'year'" +
                ', age("age"."dob")) < 30 THEN ' +
                "'20대'" +
                ' WHEN date_part(' +
                "'year'" +
                ', age("age"."dob")) < 40 THEN ' +
                "'30대'" +
                ' WHEN date_part(' +
                "'year'" +
                ', age("age"."dob")) < 50 THEN ' +
                "'40대'" +
                ' WHEN date_part(' +
                "'year'" +
                ', age("age"."dob")) < 60 THEN ' +
                "'50대'" +
                ' WHEN date_part(' +
                "'year'" +
                ', age("age"."dob")) < 70 THEN ' +
                "'60대'" +
                ' WHEN date_part(' +
                "'year'" +
                ', age("age"."dob")) < 80 THEN ' +
                "'70대'" +
                ' WHEN date_part(' +
                "'year'" +
                ', age("age"."dob")) < 90 THEN ' +
                "'80대'" +
                ' ELSE ' +
                "'모름'" +
                ' END'),
            'age'
        ]
    ],
    militery: [
        [
            Seq.literal('CASE WHEN "militery"."militery" > 0 THEN "militery->militery_type"."description" ELSE ' +
                "'없음'" +
                ' END'),
            'militery'
        ]
    ],
    mariage: [
        [
            Seq.literal('CASE WHEN "mariage"."mariage" > 0 THEN "mariage->mariage_type"."description" ELSE ' +
                "'없음'" +
                ' END'),
            'mariage'
        ]
        // [Seq.literal('(json_object_agg((CASE WHEN "mariage"."mariage" > 0 THEN "mariage"."mariage" ELSE 0 END), (CASE WHEN "mariage"."mariage" > 0 THEN "mariage->mariage_type"."description" ELSE ' + "'None'" + ' END)))'), 'mariage'],
    ],
    company: [
        // [Seq.col('company.start'), 'startDate'],
        // [Seq.col('company.end'), 'endDate'],
        // [Seq.literal('CASE WHEN "company"."id" > 0 THEN "company->hq"."uuid" ELSE null END'), 'companyUuid'],
        [
            Seq.literal('coalesce(json_agg(DISTINCT jsonb_build_object(' +
                "'companyId'" +
                ', "company->hq"."id", ' +
                "'companyUuid'" +
                ', "company->hq"."uuid", ' +
                "'startDate'" +
                ', "company"."start", ' +
                "'endDate'" +
                ', "company"."end")) filter (where "company"."id" > 0), ' +
                "'[]'" +
                ')'),
            'company'
        ]
    ],
    education: [
        // [Seq.col('education.type'), 'education'],
        [
            Seq.literal('CASE WHEN "education"."type" > 0 THEN "education->education_type"."description" ELSE ' +
                "'없음'" +
                ' END'),
            'education'
        ]
    ],
    favorite: [
        [
            Seq.literal('CASE WHEN "favorite"."id" > 0 THEN "favorite"."isStar" ELSE false END'),
            'favorite'
        ]
    ],
    // 'education':[
    //   [Seq.literal('(json_object_agg((CASE WHEN "education"."major" > 0 THEN "education"."major" ELSE 0 END), (CASE WHEN "education"."major" > 0 THEN "education->majors"."description" ELSE ' + "'None'" + ' END)))'), 'majors'],
    //   [Seq.literal('(json_object_agg((CASE WHEN "education"."type" > 0 THEN "education"."type" ELSE 0 END), (CASE WHEN "education"."type" > 0 THEN "education->types"."description" ELSE ' + "'None'" + ' END)))'), 'educationTypes'],
    // ],
    // 'certifications':[
    //   [Seq.literal('(json_object_agg((CASE WHEN "user_certifications"."certification" > 0 THEN "user_certifications"."certification" ELSE 0 END), (CASE WHEN "user_certifications"."certification" > 0 THEN "user_certifications->certifications"."description" ELSE ' + "'None'" + ' END)))'), 'certifications'],
    // ],
    cosine: [
        [
            Seq.literal('(json_build_object(' +
                "'id'" +
                ',' +
                '"user_cosines"."id"' +
                ',' +
                "'values'" +
                ',' +
                '"user_cosines"."value"' +
                ',' +
                "'questions'" +
                ',' +
                '(CASE WHEN "user_cosine_data"."id" > 0 THEN ' +
                'json_agg(json_build_object(' +
                "'id'" +
                ',' +
                '"user_cosine_data"."id"' +
                ',' +
                "'label'" +
                ',' +
                '"user_cosine_data"."label"' +
                ',' +
                "'data'" +
                ',' +
                '"user_cosine_data"."data"' +
                '))' +
                ' END )' +
                '))'),
            'cosine'
        ]
    ],
    permission: [
        'id',
        'uuid',
        // [Seq.col('company.companyId'), 'companyId'],
        // [Seq.literal('array_agg(roles.role)'), 'permissions'],
        [Seq.literal('array_agg(DISTINCT roles.role)'), 'permissions'],
        // [Seq.col('company->hq.uuid'), 'companyUuid'],
        [
            Seq.literal('coalesce(json_agg(DISTINCT jsonb_build_object(' +
                "'companyId'" +
                ', "company"."companyId", ' +
                "'companyUuid'" +
                ', "company->hq"."uuid")) filter (where "company"."id" > 0), ' +
                "'[]'" +
                ')'),
            'company'
        ]
    ]
};
exports.attributes = attributes;
