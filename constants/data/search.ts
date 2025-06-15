import scheduled from "../../assets/images/scheduled.png"
import saved from "../../assets/images/saved.png"
import trip from "../../assets/images/trip.png"
import favorites from "../../assets/images/favorites.png"

export const searchData = [
    {    id: '1',
        img: scheduled,
        title: 'Scheduled Trips',
        subtitle: 'View your upcoming trips and stay on track.',
        path: '/(schedule)',
    },

    {    id: '2',
        img: saved,
        title: 'Saved Locations',
        subtitle: 'Save favorite spots for faster trip searches',
        path: '',
    },

    {    id: '3',
        img: trip,
        title: 'Trip History',
        subtitle: 'See a log of your completed trips.',
        path: '/tripHistory/tripHistory',
    },

    {    id: '4',
        img: favorites,
        title: 'Favorites Drivers',
        subtitle: 'Reconnect with drivers you enjoyed traveling with.',
        path: '',
    },
]