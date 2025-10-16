import { Blog, Brand, FeatBrand, OptionSuggest, StatusCarBlog, Suggest } from "./typeData";

export const DATA_EXPAND: FeatBrand[] = [
    {
        id: 0,
        name: 'Used Cars',
        data: [
            {
                id: 0,
                name: 'Ford',
                path: '/ford',
            },
            {
                id: 1,
                name: 'BMW',
                path: '/bmw',
            },
            {
                id: 2,
                name: 'KIA',
                path: '/kia',
            }
        ],
    },
    {
        id: 1,
        name: 'Any Makes',
        data: [
            {
                id: 0,
                name: 'Toyota',
                path: '/toyota',
            },
            {
                id: 1,
                name: 'Honda',
                path: '/honda',
            },
            {
                id: 2,
                name: 'Chevrolet',
                path: '/chevrolet',
            },
        ],
    },
    {
        id: 2,
        name: 'Any Models',
        data: [
            {
                id: 0,
                name: 'Camry',
                path: '/toyota/camry',
            },
            {
                id: 1,
                name: 'Civic',
                path: '/honda/civic',
            },
            {
                id: 2,
                name: 'Malibu',
                path: '/chevrolet/malibu',
            },
        ],
    },
    {
        id:3,
        name:'Prices',
        data:null,
    }
];


export const DATA_BODY:Brand[]=[
    {
        name:'Sedan',
        img:require('src/assets/images/homepage/boder_style/sedan.png'),
        id:0,
    },
    {
        name:'Coupe',
        img:require("src/assets/images/homepage/boder_style/coupe.png"),
        id:1,
    },{
        name:'SUV',
        img:require("src/assets/images/homepage/boder_style/suv.png"),
        id:2,
    },{
        name:'Truck',
        img:require("src/assets/images/homepage/boder_style/truck.png"),
        id:3,
    },{
        name:'HatchBack',
        img:require("src/assets/images/homepage/boder_style/hat.png"),
        id:4,
    }
    ,{
        name:'Convertible',
        img:require("src/assets/images/homepage/boder_style/mini.png"),
        id:5,
    }
]

export const DATA_SUGGEST:Suggest[]=[
    {
        title:'Special Financing Offers',
        script:'Our stress-free finance department that can find financial solutions to save you money.',
        icon:require('src/assets/images/homepage/f-d-1.svg fill.png'),
        id:0,
    },
    {
        title:'Trusted Car Dealership',
        script:'Our stress-free finance department that can find financial solutions to save you money.',
        icon:require('src/assets/images/homepage/f-d-2.svg fill.png'),
        id:1,
    }
    ,
    {
        title:'Transparent Pricing',
        script:'Our stress-free finance department that can find financial solutions to save you money.',
        icon:require('src/assets/images/homepage/f-d-3.svg fill.png'),
        id:2,
    },
    {
        title:'Expert Car Service',
        script:'Our stress-free finance department that can find financial solutions to save you money.',
        icon:require('src/assets/images/homepage/f-d-4.svg fill.png'),
        id:3,
    }
]



 
  export const DATA_OPTION_SUGGEST:OptionSuggest[]=[
    {
      id:0,
      title:'Are You Looking For a Car ?',
      script:'We are committed to providing our customers with exceptional service.',
      icon:require('src/assets/images/homepage/look_car.png'),
      path:'/',
    },
    {
      id:1,
      title:'Do You Want to Sell a Car ?',
      script:'We are committed to providing our customers with exceptional service.',
      icon:require('src/assets/images/homepage/sell_car.png'),
      path:'/',
    }
  ]  



  export const DATA_BLOG: Blog[] = [
    {
      img: require('src/assets/images/homepage/lastest_blog_post_1.png'),
      script: "Đánh giá chi tiết về hệ thống âm thanh trên xe XYZ",
      owner: "Admin",
      id: 0,
      date: new Date("2024-03-15"),
      status: StatusCarBlog.SOUND,
      name: 'Car Audio Expertise'
    },
    {
      img: require('src/assets/images/homepage/lastest_blog_post_2.png'),
      script: "Top 5 phụ kiện cần thiết cho xe hơi của bạn",
      owner: "Admin",
      id: 1,
      date: new Date("2024-03-18"),
      status: StatusCarBlog.ACCESSORIES,
      name: 'Essential Car Accessories'
    },
    {
      img: require('src/assets/images/homepage/lastest_blog_post_3.png'),
      script: "Cách bảo vệ lớp sơn xe trong mùa hè",
      owner: "Admin",
      id: 2,
      date: new Date("2024-03-20"),
      status: StatusCarBlog.EXTERIOR,
      name: "Protecting Your Car's Finish"
    },
    {
      img: require('src/assets/images/homepage/latest_blog_car_4.jpg'),
      script: "So sánh chất lượng âm thanh giữa các hãng xe hơi",
      owner: "Admin",
      id: 3,
      date: new Date("2024-03-22"),
      status: StatusCarBlog.SOUND,
      name: 'Car Audio Showdown'
    },
    {
      img: require('src/assets/images/services/ourservices2.jpg'),
      script: "This week in tech: AI advancements and their impact on society",
      owner: "admin",
      id: 4,
      date: new Date("2024-10-15"),
      status: StatusCarBlog.ACCESSORIES,
      name: "Tech Trends Weekly"
    },
    {
      img: require('src/assets/images/services/ourservices3.png'),
      script: "Exploring hidden gems in Southeast Asia",
      owner: "travelblogger123",
      id: 5,
      date: new Date("2024-10-18"),
      status: StatusCarBlog.EXTERIOR,
      name: "Wanderlust Adventures"
    },
    {
      img: require('src/assets/images/services/ourservices4.jpg'),
      script: "5 easy vegan recipes for busy professionals",
      owner: "admin",
      id: 6,
      date: new Date("2024-10-20"),
      status: StatusCarBlog.SOUND,
      name: "Quick & Healthy Eats"
    },
    {
      id: "2021001",
      name: "Hệ thống âm thanh cao cấp cho xe hơi năm 2021",
      img:"",
      script: "Khám phá những công nghệ âm thanh mới nhất cho xe hơi trong năm 2021. Từ hệ thống loa Bang & Olufsen đến Harman Kardon, chúng tôi sẽ điểm qua những option tốt nhất cho việc nâng cấp âm thanh xe của bạn.",
      owner: "admin",
      date: new Date("2021-03-15"),
      status: StatusCarBlog.SOUND
  },
  {
      id: "2021002",
      name: "Xu hướng độ ngoại thất xe hơi 2021",
      img:"",
      script: "Tổng hợp những xu hướng độ ngoại thất xe hơi hot nhất 2021: từ bodykit carbon fiber đến màu sơn ngụy trang. Cùng tìm hiểu những style được ưa chuộng nhất năm nay.",
      owner: "admin",
      date: new Date("2021-08-22"),
      status: StatusCarBlog.EXTERIOR
  },

  // Năm 2022
  {
      id: "2022001",
      name: "Top phụ kiện công nghệ must-have 2022",
      img:"",
      script: "Điểm qua những phụ kiện công nghệ không thể thiếu cho xế hộp trong năm 2022: từ sạc không dây tích hợp đến camera hành trình AI. Những sản phẩm này sẽ giúp việc lái xe của bạn an toàn và tiện nghi hơn.",
      owner: "TechExpert",
      date: new Date("2022-02-10"),
      status: StatusCarBlog.ACCESSORIES
  },
  {
      id: "2022002",
      name: "Cải tiến hệ thống âm thanh xe hơi 2022",
      img:"",
      script: "Hướng dẫn chi tiết cách nâng cấp hệ thống âm thanh xe hơi theo tiêu chuẩn 2022. Từ việc chọn loa, amply đến cách đi dây và tinh chỉnh âm thanh để có trải nghiệm nghe nhạc tốt nhất.",
      owner: "admin",
      date: new Date("2022-06-18"),
      status: StatusCarBlog.SOUND
  },
  {
      id: "2022003",
      name: "Bodykit và thiết kế ngoại thất 2022",
      img:"",
      script: "Tổng hợp các mẫu bodykit đẹp và độc đáo nhất năm 2022. Review chi tiết về chất liệu, thiết kế và hiệu quả khí động học của từng loại bodykit.",
      owner: "CarDesigner",
      date: new Date("2022-11-30"),
      status: StatusCarBlog.EXTERIOR
  },

  // Năm 2023
  {
      id: "2023001",
      name: "Smart Accessories 2023: Phụ kiện thông minh cho xe",
      img:"",
      script: "Khám phá những phụ kiện thông minh nhất dành cho xe hơi năm 2023: từ hệ thống ADAS tới màn hình HUD thế hệ mới. Những công nghệ này sẽ giúp việc lái xe của bạn an toàn và thú vị hơn.",
      owner: "admin",
      date: new Date("2023-04-05"),
      status: StatusCarBlog.ACCESSORIES
  },
  {
      id: "2023002",
      name: "Âm thanh xe hơi: Xu hướng 2023",
      img:"",
      script: "Điểm qua những xu hướng âm thanh xe hơi nổi bật năm 2023. Từ hệ thống âm thanh 3D đến công nghệ khử ồn chủ động, khám phá những cải tiến mới nhất trong ngành công nghiệp âm thanh ô tô.",
      owner: "SoundPro",
      date: new Date("2023-07-12"),
      status: StatusCarBlog.SOUND
  },
  {
      id: "2023003",
      name: "Ngoại thất xe 2023: Màu sắc và Vật liệu mới",
      img:"",
      script: "Tổng hợp những xu hướng màu sắc và vật liệu mới nhất cho ngoại thất xe năm 2023. Từ sơn đổi màu theo nhiệt đến vật liệu composite tái chế, khám phá những innovation mới nhất trong ngành.",
      owner: "admin",
      date: new Date("2023-12-01"),
      status: StatusCarBlog.EXTERIOR
  }
  ];
  export const DATA_BRAND:Brand[]=[
    {
      name:'Audi',
      img:require('src/assets/images/brand/audi.png'),
      id:0,
    },
    {
      name:'BMW',
      img:require('src/assets/images/brand/bmw.png'),
      id:1,
    }
    ,
    {
      name:'Ford',
      img:require('src/assets/images/brand/ford.png'),
      id:2,
    }
    ,
    {
      name:'Mescedes Benz',
      img:require('src/assets/images/brand/benz.png'),
      id:3,
    }
    ,
    {
      name:'Peugeot',
      img:require('src/assets/images/brand/peugeot.png'),
      id:4,
    }
    ,
    {
      name:'Volkswagen',
      img:require('src/assets/images/brand/volkswagen.png'),
      id:5,
    }
    ,
    {
      name:'Ferrari',
      img:require('src/assets/images/brand/ferarri.jpg'),
      id:6,
    }
  ]