import trip from '../../assets/images/trip.png'
import scheduled from '../../assets/images/scheduled.png'
import saved from '../../assets/images/saved.png'
import favorites from '../../assets/images/favorites.png'

export type SearchItem = {
    id: string;
    /** Image artwork. Present on every row except the ones that use a glyph. */
    image?: ReturnType<typeof trip>;
    /** Ionicons glyph name, used only where an image is not wanted. */
    icon?: string;
    title: string;
    subtitle: string;
    path: string;
}

export const searchData: SearchItem[] = [
    {
        id: '1',
        image: trip,
        title: 'All Trips',
        subtitle: 'View all avialble rides to book.',
        path: '/(passenger)/rides',
    },

    // {
    //     id: '2',
    //     image: saved,
    //     title: 'Saved Locations',
    //     subtitle: 'Save favorite spots for faster trip searches',
    //     path: '',
    // },

    {
        id: '2',
        image: scheduled,
        title: 'Schedule a Ride',
        subtitle: 'Search rides by date and route.',
        path: '/(schedule)',
    },

    {
        id: '3',
        image: saved,
        title: 'Trip History',
        subtitle: 'See a log of your completed trips.',
        path: '/(passenger)/history',
    },

    {
        id: '4',
        image: favorites,
        title: 'Favorite Drivers',
        subtitle: 'Reconnect with drivers you enjoyed traveling with.',
        path: '/(passenger)/favoritesDriver',
    },

    {
        id: '5',
        icon: 'person-outline',
        title: 'Profile',
        subtitle: 'View and manage your account.',
        path: '/(passenger)/profile',
    },
]
