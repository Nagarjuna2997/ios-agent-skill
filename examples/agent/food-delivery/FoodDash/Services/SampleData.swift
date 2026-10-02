import Foundation

enum SampleData {
    static let restaurants: [Restaurant] = [
        Restaurant(id: "r1", name: "Sakura Sushi", cuisine: "Japanese", latitude: 37.3349, longitude: -122.0090, rating: 4.7, imageURL: nil),
        Restaurant(id: "r2", name: "Luigi's Trattoria", cuisine: "Italian", latitude: 37.3382, longitude: -122.0050, rating: 4.5, imageURL: nil),
        Restaurant(id: "r3", name: "Taco Fiesta", cuisine: "Mexican", latitude: 37.3310, longitude: -122.0150, rating: 4.3, imageURL: nil),
        Restaurant(id: "r4", name: "Green Bowl", cuisine: "Healthy", latitude: 37.3290, longitude: -122.0030, rating: 4.6, imageURL: nil),
        Restaurant(id: "r5", name: "Burger Barn", cuisine: "American", latitude: 37.3400, longitude: -122.0200, rating: 4.2, imageURL: nil),
        Restaurant(id: "r6", name: "Spice Route", cuisine: "Indian", latitude: 37.3250, longitude: -122.0100, rating: 4.8, imageURL: nil),
    ]

    static func menu(for restaurantId: String) -> [MenuItem] {
        menus[restaurantId] ?? []
    }

    private static func dish(_ r: String, _ n: Int, _ name: String, _ details: String, _ price: Int) -> MenuItem {
        MenuItem(id: "\(r)-\(n)", restaurantId: r, name: name, details: details, priceCents: price)
    }

    private static let menus: [String: [MenuItem]] = [
        "r1": [
            dish("r1", 1, "Salmon Nigiri", "Six pieces of fresh salmon nigiri", 1299),
            dish("r1", 2, "Dragon Roll", "Eel, avocado and cucumber", 1499),
            dish("r1", 3, "Miso Soup", "Tofu, seaweed and scallions", 399),
            dish("r1", 4, "Chicken Katsu", "Crispy cutlet with rice", 1349),
        ],
        "r2": [
            dish("r2", 1, "Margherita Pizza", "Tomato, mozzarella and basil", 1399),
            dish("r2", 2, "Spaghetti Carbonara", "Guanciale, egg and pecorino", 1599),
            dish("r2", 3, "Tiramisu", "Classic espresso dessert", 749),
            dish("r2", 4, "Caesar Salad", "Romaine, parmesan, croutons", 999),
        ],
        "r3": [
            dish("r3", 1, "Carne Asada Tacos", "Three tacos with salsa verde", 1199),
            dish("r3", 2, "Chicken Burrito", "Rice, beans and grilled chicken", 1249),
            dish("r3", 3, "Guacamole & Chips", "Made fresh daily", 699),
        ],
        "r4": [
            dish("r4", 1, "Quinoa Power Bowl", "Roasted veggies and tahini", 1299),
            dish("r4", 2, "Acai Bowl", "Berries, granola and honey", 1099),
            dish("r4", 3, "Green Smoothie", "Spinach, apple and ginger", 699),
        ],
        "r5": [
            dish("r5", 1, "Classic Cheeseburger", "Beef patty, cheddar, pickles", 1199),
            dish("r5", 2, "Loaded Fries", "Cheese, bacon and chives", 799),
            dish("r5", 3, "Chocolate Shake", "Thick and creamy", 649),
        ],
        "r6": [
            dish("r6", 1, "Butter Chicken", "Creamy tomato curry with rice", 1599),
            dish("r6", 2, "Garlic Naan", "Fresh from the tandoor", 399),
            dish("r6", 3, "Vegetable Biryani", "Fragrant basmati rice", 1399),
            dish("r6", 4, "Mango Lassi", "Chilled yogurt drink", 549),
        ],
    ]
}
