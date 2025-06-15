
import userOne from "../../assets/images/user_logo img (1).png"
import userTwo from "../../assets/images/user_logo img.png"
import up from "../../assets/images/up.png"
import down from "../../assets/images/down_arrow.png"
import arrow from "../../assets/images/arrow-right.png"

export const riderListData = [


    {
        id: '1',
        plate_no: 'KTU-342AQ',
        price: '18,000',
        image: userOne,
        rider_name: 'Olabode Amade',
        vehicle: 'Toyota RAV4, Grey',
        location_details: [
            {   id: '1',
                first_location: 'Ikeja, Lagos',
                first_direction: 'No 25, Ajao Estate, Road 1, Ajao Estate, Ikeja, Lagos State',
                time: '07:45 AM',
                date:'25th may 2025',
                image: up ,
                view: "View Routes",
                arrow: arrow,
             price: '18,000',
            },

            {   id: '2',
                first_location: 'Benin City, Edo',
                first_direction: 'University Of Benin',
                time: '07:45 AM',
                image: down,
            },
        ]
    },

    {

        
        id: '2',
        plate_no: 'LAG-678BC',
        price: '20,500',
        image: userOne,
        rider_name: 'Emeka Okafor',
        vehicle: 'Honda Accord, Black',
        location_details: [
            {
                id: '1',
                first_location: 'Victoria Island, Lagos',
                first_direction: 'No 10, Adeola Odeku Street, VI, Lagos',
                time: '07:45 AM',
                image: up ,
                view: "View Routes",
                 arrow: arrow,
                        price: '18,000',
                              date:'25th may 2025',
            },
            {
                id: '2',
                first_location: 'Ibadan, Oyo',
                first_direction: 'University of Ibadan, Oyo State',
                time: '07:45 AM',
                image: down,
                view: "View Routes",
            },
        ],
    },
    {
        id: '3',
        plate_no: 'ABJ-123XY',
        price: '25,000',
        image: userTwo,
        rider_name: 'Fatima Bello',
        vehicle: 'Toyota Corolla, White',
        location_details: [
            {
                id: '1',
                first_location: 'Garki, Abuja',
                first_direction: 'No 5, Garki Area 11, Abuja',
                time: '07:45 AM',
                image: up ,
                view: "View Routes",
                 arrow: arrow,
                  price: '18,000',
                date:'25th may 2025',
            },
            {
                id: '2',
                first_location: 'Kano, Kano',
                first_direction: 'Bayero University, Kano State',
                time: '07:45 AM',
                image: down ,
            },
        ],
    },
    {
        id: '4',
        plate_no: 'PHC-456DE',
        price: '22,000',
        image: userOne,
        rider_name: 'John Oche',
        vehicle: 'Lexus RX350, Silver',
        location_details: [
            {
                id: '1',
                first_location: 'Port Harcourt, Rivers',
                first_direction: 'No 15, Rumuokoro Junction, PH',
                time: '07:45 AM',
                image: up ,
                view: "View Routes", 
                arrow: arrow,
           price: '18,000',
        date:'25th may 2025',
            },
            {
                id: '2',
                first_location: 'Enugu, Enugu',
                first_direction: 'University of Nigeria, Nsukka',
                time: '07:45 AM',
                image: down,
            },
        ],
    }
]


export interface riderlist  {
        id: string;
    first_location: string;
    first_direction: string;
    time: string;
    image: any;
    view?: string;
    arrow?: any;
    price?: any;
    date?:string;
}
