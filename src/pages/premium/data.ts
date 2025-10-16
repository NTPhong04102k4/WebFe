type PlanFeature = {
    included: boolean;
    text: string;
  };
  
  type PlanData = {
    id: string|number;
    price: number;
    namePackage: string;
    script: string;
    listings: number;
    daysVisibility: number;
    revisions: number;
    daysDeliveryTime: number;
    features: PlanFeature[];
  };
  
  export const DATA_PREMIUM: PlanData[] = [
    {
      id: 0,
      price: 29,
      namePackage: "Basic Plan",
      script: "Quis autem vel eum iure reprehenderit qui in ea voluptate velit.",
      listings: 5,
      daysVisibility: 30,
      revisions: 2,
      daysDeliveryTime: 3,
      features: [
        { included: true, text: "Highlighted in Search Results" },
        { included: true, text: "Production Support" }
      ]
    },
    {   id:1,
        price: 49.99,
        namePackage: "Standard Premium",
        script: "Quis autem vel eum iure reprehenderit qui in ea voluptate velit.",
        listings: 60,
        daysVisibility: 150,
        revisions: 3,
        daysDeliveryTime: 7,
        features: [
            { included: true, text: "Highlighted in Search Results" },
            { included: true, text: "Production Support" }
          ]
    },
    {   
        id:2,
        price: 79.99,
        namePackage: "Professional Premium",
        script: "Quis autem vel eum iure reprehenderit qui in ea voluptate velit.",
        listings: 80,
        daysVisibility: 200,
        revisions: 3,
        daysDeliveryTime: 7,
        features: [
            { included: true, text: "Highlighted in Search Results" },
            { included: true, text: "Production Support" }
          ]
    },
    {
        id:3,
        price: 149.99,
        namePackage: "Enterprise Premium",
        script: "Quis autem vel eum iure reprehenderit qui in ea voluptate velit.",
        listings: 100,
        daysVisibility: 365,
        revisions: 3, // Unlimited revisions
        daysDeliveryTime: 7,
        features: [
            { included: true, text: "Highlighted in Search Results" },
            { included: true, text: "Production Support" }
          ]
    }
]