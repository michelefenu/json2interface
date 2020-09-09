const json2interface = require('./lib/json2interface')
module.exports = json2interface

let result

/* result = json2interface.generate(
  JSON.stringify({
    data: {
      observations: {
        numerical: [
          {
            name: 'Hematology studies',
            examinations: [
              {
                type: 'Hb - EMOGLOBINA A2',
                magnitude: '5.962',
                units: '% Hb tot',
                lowerMagnitude: '2.0',
                upperMagnitude: '3.3',
                abnormal: 'true'
              }
            ]
          },
          {
            name: 'Chemistry studies ',
            examinations: [
              {
                type: 'MAGNESIO',
                magnitude: '3.409',
                units: 'mEq/L',
                lowerMagnitude: '1.41',
                upperMagnitude: '1.85',
                abnormal: 'true'
              }
            ]
          },
          {
            name: 'Coagulation studies',
            examinations: [
              {
                type: 'EMOGLOBINA GLICATA',
                magnitude: '32.58',
                units: 'mmol/mol',
                lowerMagnitude: '20.0',
                upperMagnitude: '42.0',
                abnormal: 'false'
              }
            ]
          },
          {
            name: 'Urinalysis studies',
            examinations: [
              {
                type: 'UREA (S/P/U/dU)',
                magnitude: '84024.94',
                units: 'mg/24h',
                lowerMagnitude: '26000.0',
                upperMagnitude: '43000.0',
                abnormal: 'true'
              }
            ]
          }
        ],
        nonNumerical: [
          {
            name: 'Serology Studies',
            value: null,
            testArray: [1, 2, 3],
            examinations: [
              {
                type: 'ANTICORPI ANTI A/B',
                value: 'POSITIVO',
                abnormal: 'true'
              }
            ]
          }
        ]
      },
      compositionName: 'Referto di Laboratorio'
    }
  })
)
 */
result = json2interface.generate(
  JSON.stringify([
    {
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      address: {
        street: 'Kulas Light',
        suite: 'Apt. 556',
        city: 'Gwenborough',
        zipcode: '92998-3874',
        geo: {
          lat: '-37.3159',
          lng: '81.1496'
        }
      },
      phone: '1-770-736-8031 x56442',
      website: null,
      company: [
        [
          {
            facilities: [
              {
                name: 'Romaguera-Crona',
                catchPhrase: 'Multi-layered client-server neural-net',
                bs: 'harness real-time e-markets'
              }
            ]
          }
        ]
      ]
    }
  ])
)

console.log(result)
