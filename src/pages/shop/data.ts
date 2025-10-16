export interface Categories {
    name: string,
    id: number | string,
    nums: number,
    data: DetailItem[]
}
export enum StatusAutoParts{
    BUY='Buy',
    CART  ='CART'
}
export type DetailItem = {
    name: string,
    id: number | string,
    nums: number,
    priceSell: number,
    originPrice: number,
    img: string,
    status:StatusAutoParts,
    dateOfManufacture:Date
}

export const DATA_CATEGORIES: Categories[] = [
    {
        name: "Accessories",
        id: 'Accessories',
        nums: 8,
        data: [
            {
                name: "4K Dash Camera",
                id: "ACC001",
                nums: 15,
                priceSell: 104,
                originPrice: 83,
                img: require('src/assets/images/shop/accessories/camera4k.jpg'),
                status:StatusAutoParts.CART ,
                dateOfManufacture :new Date("2023-08-07"),
            },
            {
                name: "Premium Leather Steering Wheel Cover",
                id: "ACC002",
                nums: 20,
                priceSell: 35,
                originPrice: 25,
                img:require('src/assets/images/shop/accessories/steering-cover.jpg') , status:StatusAutoParts.CART ,
                dateOfManufacture:new Date("2023-03-22"),
            },
            {
                name: "Smart Phone Holder",
                id: "ACC003",
                nums: 30,
                priceSell: 25,
                originPrice: 18,
                img:require('src/assets/images/shop/accessories/phone-holder.jpg'), status:StatusAutoParts.CART ,
                dateOfManufacture:    new Date("2023-05-30"),

            },
            {
                name: "LED Interior Lighting Kit",
                id: "ACC004",
                nums: 25,
                priceSell: 45,
                originPrice: 35,
                img: require('src/assets/images/shop/accessories/led_kit.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-07-14"),

            },
            {
                name: "Tire Pressure Monitoring System",
                id: "ACC005",
                nums: 18,
                priceSell: 85,
                originPrice: 65,
                img: require('src/assets/images/shop/accessories/tpms.jpg'), status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-09-10"),

            },
            {
                name: "Car Cover Premium",
                id: "ACC006",
                nums: 12,
                priceSell: 75,
                originPrice: 55,
                img: require('src/assets/images/shop/accessories/car_cover.jpg'), status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-11-05"),

            },
            {
                name: "USB Car Charger",
                id: "ACC007",
                nums: 40,
                priceSell: 15,
                originPrice: 10,
                img:require('src/assets/images/shop/accessories/usb-charger.jpg'), status:StatusAutoParts.CART ,dateOfManufacture:   new Date("2023-12-25"),
            },
            {
                name: "Car Air Purifier",
                id: "ACC008",
                nums: 22,
                priceSell: 65,
                originPrice: 48,
                img: require('src/assets/images/shop/accessories/air-purifier.jpg'), status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2024-02-28"),

            }
        ]
    },
    {
        name: "Body Kit",
        id: 'BodyKit',
        nums: 4,
        data: [
            {
                name: "Type R Front Lip",
                id: "BK001",
                nums: 5,
                priceSell: 188,
                originPrice: 146,
                img: require('src/assets/images/shop/bodykit/front-lip.jpg'), status:StatusAutoParts.CART ,dateOfManufacture:         new Date("2024-04-18"),


            },
            {
                name: "Sport Side Skirts",
                id: "BK002",
                nums: 8,
                priceSell: 158,
                originPrice: 125,
                img: require('src/assets/images/shop/bodykit/side-skirt.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2024-06-21"),

            },
            {
                name: "Rear Diffuser Carbon",
                id: "BK003",
                nums: 6,
                priceSell: 200,
                originPrice: 167,
                img: require('src/assets/images/shop/bodykit/rear-diffuser.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2024-08-13"),

            },
            {
                name: "GT Wing Spoiler",
                id: "BK004",
                nums: 4,
                priceSell: 250,
                originPrice: 208,
                img: require('src/assets/images/shop/bodykit/gt-wing.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2024-10-05"),

            }
        ]
    },
    {
        name: "Interior",
        id: 'Interior',
        nums: 8,
        data: [
            {
                name: "5D Floor Mats",
                id: "INT001",
                nums: 25,
                priceSell: 50,
                originPrice: 33,
                img: require('src/assets/images/shop/interior/floor-mat-5d.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2024-12-12"),

            },
            {
                name: "Premium Leather Seat Covers",
                id: "INT002",
                nums: 10,
                priceSell: 117,
                originPrice: 92,
                img: require('src/assets/images/shop/interior/seat-cover.jpg') ,status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-02-15"),

            },
            {
                name: "Carbon Fiber Dashboard Trim",
                id: "INT003",
                nums: 15,
                priceSell: 83,
                originPrice: 63,
                img: require('src/assets/images/shop/interior/dash-trim.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-04-25"),

            },
            {
                name: "LED Ambient Lighting",
                id: "INT004",
                nums: 20,
                priceSell: 67,
                originPrice: 50,
                img: require('src/assets/images/shop/interior/ambient-light.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-06-30"),

            },
            {
                name: "Sport Pedal Covers",
                id: "INT005",
                nums: 30,
                priceSell: 42,
                originPrice: 29,
                img: require('src/assets/images/shop/interior/pedal-covers.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-08-22"),

            },
            {
                name: "Neck Support Pillow",
                id: "INT006",
                nums: 35,
                priceSell: 25,
                originPrice: 17,
                img: require('src/assets/images/shop/interior/neck-pillow.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-08-22"),

            },
            {
                name: "Cargo Mat",
                id: "INT007",
                nums: 18,
                priceSell: 45,
                originPrice: 33,
                img: require('src/assets/images/shop/interior/cargo-mat.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            },
            {
                name: "Shift Knob Carbon",
                id: "INT008",
                nums: 12,
                priceSell: 58,
                originPrice: 42,
                img: require('src/assets/images/shop/interior/shift-knob.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            }
        ]
    },
    {
        name: "Oil & Filters",
        id: 'oil_and_filters',
        nums: 8,
        data: [
            {
                name: "Synthetic Engine Oil 5W-40",
                id: "OIL001",
                nums: 50,
                priceSell: 40,
                originPrice: 31,
                img: require('src/assets/images/shop/oil_and_filters/engine-oil.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            },
            {
                name: "K&N Air Filter",
                id: "OIL002",
                nums: 30,
                priceSell: 63,
                originPrice: 50,
                img: require('src/assets/images/shop/oil_and_filters/air-filter.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            },
            {
                name: "Oil Filter Premium",
                id: "OIL003",
                nums: 45,
                priceSell: 15,
                originPrice: 10,
                img: require('src/assets/images/shop/oil_and_filters/oil-filter.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            },
            {
                name: "Cabin Air Filter",
                id: "OIL004",
                nums: 35,
                priceSell: 25,
                originPrice: 17,
                img: require('src/assets/images/shop/oil_and_filters/cabin-filter.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            },
            {
                name: "Transmission Fluid",
                id: "OIL005",
                nums: 40,
                priceSell: 45,
                originPrice: 35,
                img: require('src/assets/images/shop/oil_and_filters/trans-fluid.jpg'), status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            },
            {
                name: "Brake Fluid DOT 4",
                id: "OIL006",
                nums: 55,
                priceSell: 20,
                originPrice: 15,
                img: require('src/assets/images/shop/oil_and_filters/brake-fluid.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            },
            {
                name: "Power Steering Fluid",
                id: "OIL007",
                nums: 38,
                priceSell: 18,
                originPrice: 13,
                img: require('src/assets/images/shop/oil_and_filters/ps-fluid.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            },
            {
                name: "Fuel Filter",
                id: "OIL008",
                nums: 42,
                priceSell: 30,
                originPrice: 22,
                img: require('src/assets/images/shop/oil_and_filters/fuel-filter.jpg') , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            }
        ]
    },
    {
        name: "Sound",
        id: 'Sound',
        nums: 8,
        data: [
            {
                name: "JBL GTO629 Speakers",
                id: "SND001",
                nums: 12,
                priceSell: 133,
                originPrice: 117,
               img:require('src/assets/images/shop/sound/jbl-speaker.png')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            },
            {
                name: "Alpine PWE-S8 Subwoofer",
                id: "SND002",
                nums: 8,
                priceSell: 188,
                originPrice: 158,
                img:require('src/assets/images/shop/sound/alpine-sub.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            },
            {
                name: "Pioneer Head Unit",
                id: "SND003",
                nums: 10,
                priceSell: 300,
                originPrice: 250,
                img:require('src/assets/images/shop/sound/pioneer-unit.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-12-09"),

            },
            {
                name: "Amplifier 4-Channel",
                id: "SND004",
                nums: 15,
                priceSell: 250,
                originPrice: 208,
                img:require('src/assets/images/shop/sound/amplifier.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-02-10"),

            },
            {
                name: "Sound Deadening Kit",
                id: "SND005",
                nums: 20,
                priceSell: 125,
                originPrice: 100,
                img:require('src/assets/images/shop/sound/sound-kit.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-04-01"),

            },
            {
                name: "Tweeters Set",
                id: "SND006",
                nums: 25,
                priceSell: 83,
                originPrice: 67,
                img:require('src/assets/images/shop/sound/tweeters.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-06-20"),

            },
            {
                name: "Wiring Kit Premium",
                id: "SND007",
                nums: 30,
                priceSell: 75,
                originPrice: 58,
                img:require('src/assets/images/shop/sound/wiring-kit.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-08-08"),

            },
            {
                name: "Bass Remote Control",
                id: "SND008",
                nums: 18,
                priceSell: 42,
                originPrice: 33,
                img:require('src/assets/images/shop/sound/bass-control.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-03-10"),

            }
        ]
    },
    {
        name: "Wheels",
        id: 'Wheels',
        nums: 8,
        data: [
            {
                name: "Rays TE37 18-inch Wheels",
                id: "WHL001",
                nums: 16,
                priceSell: 1042,
                originPrice: 917,
                img:require('src/assets/images/shop/wheels/rays-te37.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2024-05-02"),

            },
            {
                name: "Michelin PS4 245/40R18",
                id: "WHL002",
                nums: 24,
                priceSell: 200,
                originPrice: 175,
                img:require('src/assets/images/shop/wheels/michelin-ps4.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-01-15"),

            },
            {
                name: "BBS CH-R 19-inch",
                id: "WHL003",
                nums: 12,
                priceSell: 1250,
                originPrice: 1083,
                img:require('src/assets/images/shop/wheels/bbs-chr.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-01-15"),

            },
            {
                name: "Continental Sport Contact 6",
                id: "WHL004",
                nums: 28,
                priceSell: 225,
                originPrice: 192,
                img:require('src/assets/images/shop/wheels/continental.png')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-03-05"),

            },
            {
                name: "Wheel Spacers 15mm",
                id: "WHL005",
                nums: 40,
                priceSell: 83,
                originPrice: 67,
                img:require('src/assets/images/shop/wheels/spacers.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-03-05"),

            },
            {
                name: "Lug Nuts Racing",
                id: "WHL006",
                nums: 100,
                priceSell: 42,
                originPrice: 33,
                img:require('src/assets/images/shop/wheels/lug-nuts.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-03-05"),

            },
            {
                name: "TPMS Sensors Set",
                id: "WHL007",
                nums: 30,
                priceSell: 125,
                originPrice: 100,
                img:require('src/assets/images/shop/wheels/tpms-sensors.jpg')   , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-03-05"),

            },
            {
                name: "Wheel Locks Security",
                id: "WHL008",
                nums: 45,
                priceSell: 33,
                originPrice: 25,
                img:require('src/assets/images/shop/wheels/wheel-locks.jpg')  , status:StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-03-05"),

            }
        ]
    },
    {
        name:'Exterior',
        id:'exterior',
        nums:12,
        data:[
            {
                name: "LED Headlight Assembly",
                id: "EXT001",
                nums: 24,
                priceSell: 299.99,
                originPrice: 249.99,
              img:require('src/assets/images/shop/exterior/headlight.jpg'),
                status: StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-03-05"),

              },
              {
                name: "Front Bumper Cover",
                id: "EXT002",
                nums: 15,
                priceSell: 389.99,
                originPrice: 329.99,
                img:require('src/assets/images/shop/exterior/front-bumper.jpg'),
                status: StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-03-05"),

              },
              {
                name: "Side Mirror Set",
                id: "EXT003",
                nums: 30,
                priceSell: 159.99,
                originPrice: 129.99,
                img:require('src/assets/images/shop/exterior/side-mirrors.jpg'),
                status: StatusAutoParts.CART ,dateOfManufacture:     new Date("2023-03-05"),

              },
              {
                name: "Rear Spoiler",
                id: "EXT004",
                nums: 18,
                priceSell: 199.99,
                originPrice: 169.99,
                img:require('src/assets/images/shop/exterior/spoiler.jpg'),
                status: StatusAutoParts.CART ,dateOfManufacture:         new Date("2022-01-01"),


              },
              {
                name: "Chrome Grille Insert",
                id: "EXT005",
                nums: 22,
                priceSell: 149.99,
                originPrice: 119.99,
                img:require('src/assets/images/shop/exterior/grille.jpg'),
                status: StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-03-20"),

              },
              {
                name: "Wheel Fender Set",
                id: "EXT006",
                nums: 16,
                priceSell: 279.99,
                originPrice: 239.99,
                img:require('src/assets/images/shop/exterior/fender.png'),
                status: StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-03-20"),

              },
              {
                name: "Door Handle Set",
                id: "EXT007",
                nums: 40,
                priceSell: 89.99,
                originPrice: 69.99,
                img:require('src/assets/images/shop/exterior/door-handles.jpg'),
                status: StatusAutoParts.CART ,dateOfManufacture:     new Date("2022-03-20"),

              },
              {
                name: "Tail Light Assembly",
                id: "EXT008",
                nums: 28,
                priceSell: 249.99,
                originPrice: 199.99,
                img:require('src/assets/images/shop/exterior/tail-light.jpg'),
                status: StatusAutoParts.CART ,dateOfManufacture:     new Date("2020-12-31")

              },
              {
                name: "Hood Scoop",
                id: "EXT009",
                nums: 12,
                priceSell: 129.99,
                originPrice: 99.99,
                img:require('src/assets/images/shop/exterior/hood-scoop.jpg'),
                status: StatusAutoParts.CART ,dateOfManufacture:     new Date("2021-02-14"),

              },
              {
                name: "Rear Bumper Cover",
                id: "EXT010",
                nums: 14,
                priceSell: 359.99,
                originPrice: 299.99,
                img:require('src/assets/images/shop/exterior/rear-bumper.jpg'),
                status: StatusAutoParts.CART ,dateOfManufacture:     new Date("2020-10-20"),

              },
              {
                name: "Side Skirt Set",
                id: "EXT011",
                nums: 20,
                priceSell: 229.99,
                originPrice: 189.99,
                img:require('src/assets/images/shop/exterior/side-skirts.jpg'),
                status: StatusAutoParts.CART ,dateOfManufacture:     new Date("2020-08-09"),

              },
              {
                name: "Windshield Assembly",
                id: "EXT012",
                nums: 10,
                priceSell: 449.99,
                originPrice: 379.99,
                img:require('src/assets/images/shop/exterior/windshield.jpg'),
                status: StatusAutoParts.CART ,dateOfManufacture:     new Date("2020-08-09"),

              }
        ],
    }
];