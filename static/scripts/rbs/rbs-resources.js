//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// Calendar Resources ////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Master list of resources, add all resources to this list //

// Compulsory object properties //
// id: no spaces or special characters! For UOW calendars it must match a calendar display name in DAViCAL. iPad calendars use this as well but in a different way, since some cleanup is required.
// type: a grouping for the resource, used in the frontend inc booking form
// title: this is the name to appear in the frontend

// Optional object properties //
// vivid: Boolean to depict a vivid compatible room
// capacity: used in frontend and to calculate booking form suitability
// level: used in the room info page to highlight a map

window.allresources = [

	{ id: 'D27', type: 'Video Conferencing', vivid: true, capacity: 8, level: 'd', title: 'D27',
	description: 'Dedicated video conferencing room located on Level D. Fitted with a PC and dual displays for sharing content while video conferencing.' },

	{ id: 'D31', type: 'Video Conferencing', vivid: true, capacity: 14, level: 'd', title: 'D31',
	description: 'First-floor room with ample natural light. Ideal for seminars, classes or meetings. Conveniently located near our on-site café. Features wall-mounted whiteboard, data projector and in-built PC.' },

	{ id: 'VividA', type: 'Vivid Trolleys', capacity: 0, title: 'Vivid Trolley A',
	description: 'Wellington Vivid Trolley A' },

	{ id: 'VividB', type: 'Vivid Trolleys', capacity: 0, title: 'Vivid Trolley B',
	description: 'Wellington Vivid Trolley B' },

	{ id: 'C03', type: 'Small Rooms', vivid: true, capacity: 18, level: 'c', title: 'C03',
	description: 'Suitable for small meetings, tutorials or interviews. Features a smartboard that can be plugged into laptops and utilized as an interactive projector.' },

	{ id: 'C04', type: 'Small Rooms', vivid: true, capacity: 18, level: 'c', title: 'C04',
	description: 'Suitable for small meetings, tutorials or interviews. Features a smartboard that can be plugged into laptops and utilized as an interactive projector.' },

	{ id: 'C46', type: 'Small Rooms', vivid: true, capacity: 10, level: 'c', title: 'C46',
	description: 'Suitable for small meetings, tutorials or interviews. Features a wall-mounted whiteboard and projector.' },

	{ id: 'D08', type: 'Medium Rooms', vivid: true, capacity: 16, level: 'd', title: 'D08',
	description: 'First-floor room with ample natural light. Ideal for seminars, classes or meetings. Conveniently located near our on-site café. Features wall-mounted whiteboard, data projector and in-built PC.' },

	{ id: 'C31', type: 'Medium Rooms', vivid: true, capacity: 20, level: 'c', title: 'C31',
	description: 'C03 is a small room on level C' },

	{ id: 'C47', type: 'Medium Rooms', vivid: true, capacity: 14, level: 'c', title: 'C47',
	description: 'Compact room, well-suited for meetings or seminars, classes, tutorials and interviews. Features a wall-mounted whiteboard and projector.' },

	{ id: 'C48', type: 'Medium Rooms', vivid: true, capacity: 12, level: 'c', title: 'C48',
	description: 'Compact room, well-suited for meetings or seminars, classes, tutorials and interviews. Features a wall-mounted whiteboard and projector.' },

	{ id: 'C02C05', type: 'Large Rooms', vivid: true, capacity: 30, level: 'c', title: 'C02 & C05',
	description: 'A room made up of C02 and C05 combined. Well lit with natural light. Great for board meetings and teaching, formal or informal occasions. Features 2 wall-mounted whiteboards, data projector and built-in PC.' },

	{ id: 'C02', parentId: 'C02C05', vivid: true, type: 'Large Rooms', capacity: 15, level: 'c', title: 'C02',
	description: 'A spacious room with natural lighting, that also opens up to become a joint room with C05. Ideal as a classroom or meeting room. Features a wall-mounted whiteboard.' },

	{ id: 'C05', parentId: 'C02C05', vivid: true, type: 'Large Rooms', capacity: 14, level: 'c', title: 'C05',
	description: 'A spacious room with natural lighting, that also opens up to become a joint room with C05. Ideal as a classroom or meeting room. Features wall-mounted whiteboard, data projector and built-in PC.' },

	{ id: 'C06', type: 'Large Rooms', vivid: true, capacity: 24, level: 'c', title: 'C06',
	description: 'Large room with ample natural light. Excellent for board meetings, seminars and classes. Features a wall-mounted whiteboard, data projector and in-built PC.' },

	{ id: 'D07', type: 'Large Rooms', vivid: true, capacity: 16, level: 'd', title: 'D07',
	description: 'First-floor room with ample natural light. Ideal for seminars, classes or meetings. Conveniently located near our on-site café. Features wall-mounted whiteboard, data projector and in-built PC.' },

	{ id: 'C07', type: 'Common Area', vivid: true, capacity: 24, level: 'c', title: 'C07',
	description: 'Sunlit and spacious, with floor-to-ceiling windows. Pull-down blinds provide adjustable lighting for presentations. Great for social occasions, meetings, workshops or catered functions. Features large portable whiteboard and data projector. ' },

	{ id: 'C10', type: 'Computer Labs', vivid: true, capacity: 20, level: 'c', title: 'C10',
	description: 'C10 is a computer lab designed for 20 users. It is located on Level C and can be accessed from the foyer or from within the library. Technology Services are also nearby for support' },

	{ id: 'C13', type: 'Computer Labs', vivid: true, capacity: 16, level: 'c', title: 'C13',
	description: 'C13 is a computer lab designed for training sessions and suits up to 16 users. It is located on level C next to the reception. Technology Services are also nearby for support' },

	{ id: 'Cafe', type: 'Lobbies', capacity: 100, level: 'd', title: 'Cafe Dining Area',
	description: 'A spacious area perfect for functions and catering occasions (for hire evenings and weekends only). Café seating available. We recommend Simply Food for all your catering requirements. For further information please see the Simply Food Website http://www.simplyfood.co.nz' },

	{ id: 'Lobby', type: 'Lobbies', capacity: 50, level: 'd', title: 'Level D Lobby',
	description: 'The lobby area features a sunken bay seating area and natural light. Audio is available with cordless microphone.' },

	{ id: 'G22', type: 'Seminar Rooms', capacity: 20, level: 'g', title: 'G22',
	description: 'The lobby area features a sunken bay seating area and natural light. Audio is available with cordless microphone.' },

	{ id: 'G23', type: 'Seminar Rooms', capacity: 22, level: 'g', title: 'G23',
	description: 'The lobby area features a sunken bay seating area and natural light. Audio is available with cordless microphone.' },

	{ id: 'Nordmeyer', type: 'Lecture Theatres', capacity: 257, title: 'Nordmeyer',
	description: 'The Nordmeyer theatre, refurbished in 2007, is our largest room seating 257 people theatre style, with tablet top seats and access for four wheelchairs - two located at the bottom of the theatre and two at the top. The Nordmeyer Theatre features duel projection with the ability to display presentations and multimedia from the built in computer and a laptop concurrently, as well as dvd/video devices and document cameras. There is also a microphone and lapel microphone.' },

	{ id: 'SLT', type: 'Lecture Theatres', capacity: 87, title: 'Small Lecture Theatre',
	description: 'The Small Lecture Theatre seats 119 people in tiered theatre style. All seats are fitted with a tablet top. The tablets can be moved to the side if required. There are also two wheelchair access seats available - one at the bottom of the theatre the other at the top. The theatre features state-of-the-art audio-visuals including the built-in data projector and lectern complete with computer, DVD accessibility and touch screen control panel. There is also a microphone and lapel microphone fitted for the ease of the speakers. These features make this theatre straightforward to use whilst not compromising on technology.' },

	{ id: 'UOWTAB034', type: 'iPads', capacity: 0, title: 'UOWTAB034',
	description: 'iPad for individual loan' },

	{ id: 'UOWTAB035', type: 'iPads', capacity: 0, title: 'UOWTAB035',
	description: 'iPad for individual loan' },

	{ id: 'UOWTAB036', type: 'iPads', capacity: 0, title: 'UOWTAB036',
	description: 'iPad for individual loan' },

	{ id: 'UOWTAB037', type: 'iPads', capacity: 0, title: 'UOWTAB037',
	description: 'iPad for individual loan' },

	{ id: 'UOWTAB038', type: 'iPads', capacity: 0, title: 'UOWTAB038',
	description: 'iPad for individual loan' },

	{ id: 'UOWTAB039', type: 'iPads', capacity: 0, title: 'UOWTAB039',
	description: 'iPad for individual loan' },

	{ id: 'iPadSetF', type: 'iPads', capacity: 0, title: 'iPad Set F - 15 iPads',
	description: 'iPad set of 15' },

	{ id: 'iPadSetG', type: 'iPads', capacity: 0, title: 'iPad Set G - 15 iPads',
	description: 'iPad set of 15' },

	{ id: 'Laptop1', type: 'Laptops', capacity: 0, title: 'Laptop 1',
	description: 'Reception laptop' },

	{ id: 'Laptop2', type: 'Laptops', capacity: 0, title: 'Laptop 2',
	description: 'Reception laptop' },

	{ id: 'Laptop3', type: 'Laptops', capacity: 0, title: 'Laptop 3',
	description: 'Reception laptop' },

	{ id: 'Laptop4', type: 'Laptops', capacity: 0, title: 'Laptop 4',
	description: 'Reception laptop' },

	{ id: 'Laptop5', type: 'Laptops', capacity: 0, title: 'Laptop 5',
	description: 'Reception laptop' }

];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Custom list function, use this function to return all resources from a specific resource type //

function parseResources(input) {
	var output = [];
	if (input == 'Vivid Rooms') {
		for (var i = 0; i < window.allresources.length; i++) {
			if (window.allresources[i].vivid == true) {
				output.push(window.allresources[i])
			};
		};
	}
	else {
		for (var i = 0; i < window.allresources.length; i++) {
			if (window.allresources[i].type == input) {
				output.push(window.allresources[i])
			};
		};
	}
	return output
};
