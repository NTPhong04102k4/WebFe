export type Person={
    name:string,
    id:string|number,
    img:string,
    job:string,
    script:string,
}
export const DATA_TEAM:Person[]=[
    {
        name:'Phong Nguyen',
        id:0,
        img:require('src/assets/images/team/demo.jpg'),
        job:'Software Developer',
        script:'The Paragraphs module puts control back into the hands of content creators. It allows them to select the types of paragraphs they want to include on a page and arrange them in any order—all through the familiar node edit screen.'
    },
    {
        name:'Minh Tan',
        id:1,
        img:require('src/assets/images/team/demo2.avif'),
        job:'Data Analyst',
        script:'There`s no need for coding, navigating the complex block placement configuration, or using Panelizer or Layout Builder overrides. Everything is managed within the node edit form, providing a seamless and centralised content creation experience.'
    },
    {
        name:'Ngoc Cong',
        id:2,
        img:require('src/assets/images/team/demo3.avif'),
        job:'Support IT',
        script:`There's no need for coding, navigating the complex block placement configuration, or using Panelizer or Layout Builder overrides. Everything is managed within the node edit form, providing a seamless and centralised content creation experience.`
    }, {
        name:'Quoc Cuong',
        id:3,
        img:require('src/assets/images/team/demo.jpg'),
        job:'Software Developer',
        script:"A vibrant ecosystem has emerged around the Paragraphs module. There are many supporting modules and the community has adopted Paragraphs as a standard way of building out complex page layouts.Nunc vulputate ac interdum."
    }
]
export const DATA_FAQ=[
    {
        question:'Does BoxCar own the cars I see online or are they owned by other.',
        answer:'Cras vitae ac nunc orci. Purus amet tortor non at phasellus ultricies hendrerit. Eget a, sit morbi nunc sit id massa.Metus, scelerisque volutpat nec sit vel donec. Sagittis, id volutpat erat vel.',
        id:0,
    },
    {
        question:'How do you choose the cars that you sell?',
        answer:'Cras vitae ac nunc orci. Purus amet tortor non at phasellus ultricies hendrerit. Eget a, sit morbi nunc sit id massa.Metus, scelerisque volutpat nec sit vel donec. Sagittis, id volutpat erat vel.',
        id:1,
    }
    ,
    {
        question:'Can I save my favorite cars to a list I can view later?',
        answer:'Cras vitae ac nunc orci. Purus amet tortor non at phasellus ultricies hendrerit. Eget a, sit morbi nunc sit id massa.Metus, scelerisque volutpat nec sit vel donec. Sagittis, id volutpat erat vel.',
        id:2,
    }
    ,
    {
        question:'Can I be notified when cars I like are added to your inventory?',
        answer:'Cras vitae ac nunc orci. Purus amet tortor non at phasellus ultricies hendrerit. Eget a, sit morbi nunc sit id massa.Metus, scelerisque volutpat nec sit vel donec. Sagittis, id volutpat erat vel.',
        id:3,
    }
    ,
    {
        question:'What tools do you have to help me find the right car for me and my budget?',
        answer:'Cras vitae ac nunc orci. Purus amet tortor non at phasellus ultricies hendrerit. Eget a, sit morbi nunc sit id massa.Metus, scelerisque volutpat nec sit vel donec. Sagittis, id volutpat erat vel.',
        id:4,
    }
]