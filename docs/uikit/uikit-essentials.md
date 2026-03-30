# UIKit Essentials

## UIViewController Lifecycle

```swift
class MyViewController: UIViewController {

    // Called once when the view is loaded into memory
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        fetchInitialData()
    }

    // Called every time the view is about to appear (animated or not)
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        navigationController?.setNavigationBarHidden(false, animated: animated)
    }

    // Called after the view has fully appeared on screen
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        startAnimations()
    }

    // Called when the view is about to be removed from the hierarchy
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        stopAnimations()
    }

    // Called after the view has been removed
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        cancelPendingRequests()
    }

    // Called when the view controller's view is released from memory
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
```

## UIView and Auto Layout

### Programmatic Constraints with Anchors

```swift
class ProfileView: UIViewController {

    private let avatarImageView: UIImageView = {
        let iv = UIImageView()
        iv.translatesAutoresizingMaskIntoConstraints = false
        iv.contentMode = .scaleAspectFill
        iv.clipsToBounds = true
        iv.layer.cornerRadius = 40
        return iv
    }()

    private let nameLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = .preferredFont(forTextStyle: .headline)
        label.adjustsFontForContentSizeCategory = true
        return label
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.addSubview(avatarImageView)
        view.addSubview(nameLabel)

        NSLayoutConstraint.activate([
            avatarImageView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            avatarImageView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            avatarImageView.widthAnchor.constraint(equalToConstant: 80),
            avatarImageView.heightAnchor.constraint(equalToConstant: 80),

            nameLabel.topAnchor.constraint(equalTo: avatarImageView.bottomAnchor, constant: 12),
            nameLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
        ])
    }
}
```

### UIStackView

```swift
func createFormStack() -> UIStackView {
    let emailField = UITextField()
    emailField.placeholder = "Email"
    emailField.borderStyle = .roundedRect

    let passwordField = UITextField()
    passwordField.placeholder = "Password"
    passwordField.borderStyle = .roundedRect
    passwordField.isSecureTextEntry = true

    let loginButton = UIButton(type: .system)
    loginButton.setTitle("Log In", for: .normal)
    loginButton.configuration = .filled()

    let stack = UIStackView(arrangedSubviews: [emailField, passwordField, loginButton])
    stack.axis = .vertical
    stack.spacing = 16
    stack.alignment = .fill
    stack.distribution = .fill
    stack.translatesAutoresizingMaskIntoConstraints = false
    return stack
}
```

## UITableView with Diffable Data Source

```swift
class ContactsViewController: UIViewController {

    enum Section { case main }

    struct Contact: Hashable {
        let id: UUID
        let name: String
        let email: String
    }

    private var tableView: UITableView!
    private var dataSource: UITableViewDiffableDataSource<Section, Contact>!

    override func viewDidLoad() {
        super.viewDidLoad()
        configureTableView()
        configureDataSource()
        applyInitialSnapshot()
    }

    private func configureTableView() {
        tableView = UITableView(frame: view.bounds, style: .insetGrouped)
        tableView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        view.addSubview(tableView)
    }

    private func configureDataSource() {
        dataSource = UITableViewDiffableDataSource<Section, Contact>(
            tableView: tableView
        ) { tableView, indexPath, contact in
            let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
            var content = cell.defaultContentConfiguration()
            content.text = contact.name
            content.secondaryText = contact.email
            cell.contentConfiguration = content
            return cell
        }
    }

    private func applyInitialSnapshot() {
        var snapshot = NSDiffableDataSourceSnapshot<Section, Contact>()
        snapshot.appendSections([.main])
        snapshot.appendItems([
            Contact(id: UUID(), name: "Alice", email: "alice@example.com"),
            Contact(id: UUID(), name: "Bob", email: "bob@example.com"),
        ])
        dataSource.apply(snapshot, animatingDifferences: true)
    }
}
```

## UICollectionView Compositional Layout

```swift
class AppStoreViewController: UIViewController {

    enum Section: Int, CaseIterable {
        case featured, categories, topApps
    }

    private func createLayout() -> UICollectionViewCompositionalLayout {
        return UICollectionViewCompositionalLayout { sectionIndex, environment in
            guard let section = Section(rawValue: sectionIndex) else { return nil }
            switch section {
            case .featured:
                return self.createFeaturedSection()
            case .categories:
                return self.createCategoriesSection()
            case .topApps:
                return self.createTopAppsSection()
            }
        }
    }

    // Full-width horizontally scrolling section
    private func createFeaturedSection() -> NSCollectionLayoutSection {
        let itemSize = NSCollectionLayoutSize(
            widthDimension: .fractionalWidth(1.0),
            heightDimension: .fractionalHeight(1.0)
        )
        let item = NSCollectionLayoutItem(layoutSize: itemSize)
        item.contentInsets = NSDirectionalEdgeInsets(top: 0, leading: 8, bottom: 0, trailing: 8)

        let groupSize = NSCollectionLayoutSize(
            widthDimension: .fractionalWidth(0.9),
            heightDimension: .absolute(250)
        )
        let group = NSCollectionLayoutGroup.horizontal(layoutSize: groupSize, subitems: [item])

        let section = NSCollectionLayoutSection(group: group)
        section.orthogonalScrollingBehavior = .groupPagingCentered
        section.contentInsets = NSDirectionalEdgeInsets(top: 16, leading: 0, bottom: 16, trailing: 0)
        return section
    }

    // Grid of categories
    private func createCategoriesSection() -> NSCollectionLayoutSection {
        let itemSize = NSCollectionLayoutSize(
            widthDimension: .fractionalWidth(0.5),
            heightDimension: .absolute(60)
        )
        let item = NSCollectionLayoutItem(layoutSize: itemSize)
        item.contentInsets = NSDirectionalEdgeInsets(top: 4, leading: 4, bottom: 4, trailing: 4)

        let groupSize = NSCollectionLayoutSize(
            widthDimension: .fractionalWidth(1.0),
            heightDimension: .absolute(60)
        )
        let group = NSCollectionLayoutGroup.horizontal(layoutSize: groupSize, subitems: [item])

        let section = NSCollectionLayoutSection(group: group)
        section.contentInsets = NSDirectionalEdgeInsets(top: 8, leading: 12, bottom: 8, trailing: 12)

        let header = NSCollectionLayoutBoundarySupplementaryItem(
            layoutSize: NSCollectionLayoutSize(widthDimension: .fractionalWidth(1.0), heightDimension: .absolute(44)),
            elementKind: UICollectionView.elementKindSectionHeader,
            alignment: .top
        )
        section.boundarySupplementaryItems = [header]
        return section
    }

    // Vertical list section
    private func createTopAppsSection() -> NSCollectionLayoutSection {
        let itemSize = NSCollectionLayoutSize(
            widthDimension: .fractionalWidth(1.0),
            heightDimension: .absolute(70)
        )
        let item = NSCollectionLayoutItem(layoutSize: itemSize)

        let groupSize = NSCollectionLayoutSize(
            widthDimension: .fractionalWidth(1.0),
            heightDimension: .absolute(70)
        )
        let group = NSCollectionLayoutGroup.vertical(layoutSize: groupSize, subitems: [item])

        let section = NSCollectionLayoutSection(group: group)
        section.contentInsets = NSDirectionalEdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16)
        return section
    }
}
```

## UINavigationController and UITabBarController

```swift
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        window = UIWindow(windowScene: windowScene)

        // Tab bar with navigation controllers
        let homeNav = UINavigationController(rootViewController: HomeViewController())
        homeNav.tabBarItem = UITabBarItem(title: "Home", image: UIImage(systemName: "house"), tag: 0)

        let searchNav = UINavigationController(rootViewController: SearchViewController())
        searchNav.tabBarItem = UITabBarItem(title: "Search", image: UIImage(systemName: "magnifyingglass"), tag: 1)

        let profileNav = UINavigationController(rootViewController: ProfileViewController())
        profileNav.tabBarItem = UITabBarItem(title: "Profile", image: UIImage(systemName: "person"), tag: 2)

        let tabBar = UITabBarController()
        tabBar.viewControllers = [homeNav, searchNav, profileNav]
        tabBar.tabBar.tintColor = .systemBlue

        window?.rootViewController = tabBar
        window?.makeKeyAndVisible()
    }
}

// Programmatic navigation
class HomeViewController: UIViewController {
    func showDetail(for item: Item) {
        let detailVC = DetailViewController(item: item)
        navigationController?.pushViewController(detailVC, animated: true)
    }

    func presentModal() {
        let modalVC = ModalViewController()
        modalVC.modalPresentationStyle = .pageSheet
        if let sheet = modalVC.sheetPresentationController {
            sheet.detents = [.medium(), .large()]
            sheet.prefersGrabberVisible = true
        }
        present(modalVC, animated: true)
    }
}
```

## Keyboard Handling and UIResponder Chain

```swift
class FormViewController: UIViewController {

    @IBOutlet weak var scrollView: UIScrollView!

    override func viewDidLoad() {
        super.viewDidLoad()

        // Register for keyboard notifications
        NotificationCenter.default.addObserver(
            self, selector: #selector(keyboardWillShow),
            name: UIResponder.keyboardWillShowNotification, object: nil
        )
        NotificationCenter.default.addObserver(
            self, selector: #selector(keyboardWillHide),
            name: UIResponder.keyboardWillHideNotification, object: nil
        )

        // Dismiss keyboard on tap
        let tap = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        tap.cancelsTouchesInView = false
        view.addGestureRecognizer(tap)
    }

    @objc private func keyboardWillShow(_ notification: Notification) {
        guard let frame = notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect,
              let duration = notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double
        else { return }

        let insets = UIEdgeInsets(top: 0, left: 0, bottom: frame.height, right: 0)
        UIView.animate(withDuration: duration) {
            self.scrollView.contentInset = insets
            self.scrollView.scrollIndicatorInsets = insets
        }
    }

    @objc private func keyboardWillHide(_ notification: Notification) {
        guard let duration = notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double
        else { return }
        UIView.animate(withDuration: duration) {
            self.scrollView.contentInset = .zero
            self.scrollView.scrollIndicatorInsets = .zero
        }
    }

    @objc private func dismissKeyboard() {
        view.endEditing(true)
    }
}

// UITextField delegate for field navigation
extension FormViewController: UITextFieldDelegate {
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        if let nextField = view.viewWithTag(textField.tag + 1) as? UITextField {
            nextField.becomeFirstResponder()
        } else {
            textField.resignFirstResponder()
        }
        return true
    }
}
```
