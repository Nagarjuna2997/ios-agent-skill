# UIKit Animations

Complete reference for UIView animations, UIViewPropertyAnimator, custom view controller transitions, and Core Animation.

---

## UIView.animate

### Basic Animation

```swift
UIView.animate(withDuration: 0.3) {
    self.cardView.alpha = 0.0
    self.cardView.transform = CGAffineTransform(scaleX: 0.8, y: 0.8)
}

// With completion handler
UIView.animate(withDuration: 0.5, animations: {
    self.cardView.center.y += 200
}) { finished in
    if finished {
        self.cardView.removeFromSuperview()
    }
}
```

### Options and Delay

```swift
UIView.animate(
    withDuration: 0.6,
    delay: 0.1,
    options: [.curveEaseInOut, .allowUserInteraction],
    animations: {
        self.button.transform = .identity
        self.button.backgroundColor = .systemBlue
    },
    completion: nil
)

// Common options:
// .curveEaseIn, .curveEaseOut, .curveEaseInOut, .curveLinear
// .repeat, .autoreverse
// .allowUserInteraction
// .beginFromCurrentState -- blend with in-flight animations
// .layoutSubviews -- commit layout changes during animation
```

### Spring Animation

```swift
UIView.animate(
    withDuration: 0.6,
    delay: 0,
    usingSpringWithDamping: 0.7,        // 0 = very bouncy, 1 = no bounce
    initialSpringVelocity: 0.3,          // Higher = faster initial movement
    options: [.curveEaseInOut],
    animations: {
        self.floatingCard.transform = .identity
        self.floatingCard.alpha = 1.0
    },
    completion: nil
)
```

**Damping guidelines:**
- `0.5-0.6` -- playful, noticeable bounce (good for pop-in effects)
- `0.7-0.8` -- natural, subtle bounce (good for most UI elements)
- `0.9-1.0` -- minimal bounce, smooth settle (good for sheets, modals)

### Keyframe Animations

```swift
UIView.animateKeyframes(
    withDuration: 1.5,
    delay: 0,
    options: [.calculationModeCubic],
    animations: {
        // Phase 1: scale up and fade in (0% to 25%)
        UIView.addKeyframe(withRelativeStartTime: 0, relativeDuration: 0.25) {
            self.iconView.transform = CGAffineTransform(scaleX: 1.2, y: 1.2)
            self.iconView.alpha = 1.0
        }

        // Phase 2: rotate (25% to 50%)
        UIView.addKeyframe(withRelativeStartTime: 0.25, relativeDuration: 0.25) {
            self.iconView.transform = CGAffineTransform(rotationAngle: .pi / 4)
        }

        // Phase 3: move to final position (50% to 75%)
        UIView.addKeyframe(withRelativeStartTime: 0.5, relativeDuration: 0.25) {
            self.iconView.center = self.finalPosition
            self.iconView.transform = .identity
        }

        // Phase 4: settle (75% to 100%)
        UIView.addKeyframe(withRelativeStartTime: 0.75, relativeDuration: 0.25) {
            self.iconView.transform = CGAffineTransform(scaleX: 1.05, y: 1.05)
        }
    },
    completion: { _ in
        UIView.animate(withDuration: 0.2) {
            self.iconView.transform = .identity
        }
    }
)
```

---

## UIViewPropertyAnimator

`UIViewPropertyAnimator` provides fine-grained control over animations, including pausing, reversing, scrubbing, and interactive driving.

### Creating Animators

```swift
// With timing curve
let animator = UIViewPropertyAnimator(duration: 0.5, curve: .easeInOut) {
    self.cardView.transform = CGAffineTransform(translationX: 0, y: -200)
    self.cardView.alpha = 0.5
}

// With spring damping
let springAnimator = UIViewPropertyAnimator(
    duration: 0.6,
    dampingRatio: 0.7
) {
    self.cardView.center = self.targetCenter
}

// With custom cubic timing
let cubicAnimator = UIViewPropertyAnimator(
    duration: 0.5,
    controlPoint1: CGPoint(x: 0.2, y: 0.8),
    controlPoint2: CGPoint(x: 0.2, y: 1.0)
) {
    self.cardView.frame = self.expandedFrame
}

// With spring timing parameters
let timingParams = UISpringTimingParameters(
    dampingRatio: 0.8,
    initialVelocity: CGVector(dx: 0, dy: 2)
)
let paramAnimator = UIViewPropertyAnimator(duration: 0.6, timingParameters: timingParams)
paramAnimator.addAnimations {
    self.cardView.transform = .identity
}
```

### Starting, Pausing, and Reversing

```swift
let animator = UIViewPropertyAnimator(duration: 1.0, curve: .easeInOut) {
    self.progressBar.frame.size.width = self.view.bounds.width
}

// Start
animator.startAnimation()

// Start after a delay
animator.startAnimation(afterDelay: 0.3)

// Pause
animator.pauseAnimation()

// Reverse (only while paused or active)
animator.isReversed = true
animator.startAnimation()  // Continues in reverse

// Stop and finalize
animator.stopAnimation(false)       // false = do not remove animations (stays at current position)
animator.finishAnimation(at: .end)  // .start, .current, or .end
```

### Scrubbing with fractionComplete

```swift
class ScrubViewController: UIViewController {
    private var animator: UIViewPropertyAnimator!
    private var panelView: UIView!
    private let expandedHeight: CGFloat = 400
    private let collapsedHeight: CGFloat = 80

    override func viewDidLoad() {
        super.viewDidLoad()
        setupPanel()
        setupAnimator()
        setupPanGesture()
    }

    private func setupPanel() {
        panelView = UIView()
        panelView.backgroundColor = .systemBackground
        panelView.layer.cornerRadius = 20
        panelView.layer.shadowColor = UIColor.black.cgColor
        panelView.layer.shadowOpacity = 0.2
        panelView.layer.shadowRadius = 10
        view.addSubview(panelView)

        panelView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            panelView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            panelView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            panelView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            panelView.heightAnchor.constraint(equalToConstant: collapsedHeight)
        ])
    }

    private var panelHeightConstraint: NSLayoutConstraint? {
        panelView.constraints.first { $0.firstAttribute == .height }
    }

    private func setupAnimator() {
        animator = UIViewPropertyAnimator(duration: 0.5, dampingRatio: 0.8)
        animator.addAnimations {
            self.panelHeightConstraint?.constant = self.expandedHeight
            self.view.layoutIfNeeded()
        }
        animator.pauseAnimation()
    }

    private func setupPanGesture() {
        let pan = UIPanGestureRecognizer(target: self, action: #selector(handlePan))
        panelView.addGestureRecognizer(pan)
    }

    @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
        let translation = gesture.translation(in: panelView)
        let totalDistance = expandedHeight - collapsedHeight

        switch gesture.state {
        case .changed:
            let fraction = -translation.y / totalDistance
            animator.fractionComplete = max(0, min(1, fraction))

        case .ended:
            let velocity = gesture.velocity(in: panelView).y
            if animator.fractionComplete > 0.5 || velocity < -500 {
                animator.isReversed = false
            } else {
                animator.isReversed = true
            }
            animator.continueAnimation(
                withTimingParameters: UISpringTimingParameters(dampingRatio: 0.8),
                durationFactor: 0.5
            )

        default:
            break
        }
    }
}
```

### Adding Completion Handlers

```swift
let animator = UIViewPropertyAnimator(duration: 0.4, curve: .easeOut) {
    self.toastView.alpha = 0
    self.toastView.transform = CGAffineTransform(translationX: 0, y: 20)
}

animator.addCompletion { position in
    switch position {
    case .end:
        self.toastView.removeFromSuperview()
    case .start:
        // Animation was reversed
        self.toastView.alpha = 1
        self.toastView.transform = .identity
    case .current:
        break
    @unknown default:
        break
    }
}

animator.startAnimation()
```

### Complete Interactive Card Dismiss Example

```swift
class CardDismissViewController: UIViewController {
    private var cardView: UIView!
    private var dismissAnimator: UIViewPropertyAnimator?
    private var cardOriginalCenter: CGPoint = .zero

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemGroupedBackground
        setupCard()
    }

    private func setupCard() {
        cardView = UIView()
        cardView.backgroundColor = .systemBackground
        cardView.layer.cornerRadius = 16
        cardView.layer.shadowColor = UIColor.black.cgColor
        cardView.layer.shadowOpacity = 0.15
        cardView.layer.shadowRadius = 12
        cardView.layer.shadowOffset = CGSize(width: 0, height: 4)
        view.addSubview(cardView)

        cardView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            cardView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            cardView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            cardView.widthAnchor.constraint(equalToConstant: 300),
            cardView.heightAnchor.constraint(equalToConstant: 200)
        ])

        let label = UILabel()
        label.text = "Swipe to dismiss"
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(label)
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: cardView.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: cardView.centerYAnchor)
        ])

        let pan = UIPanGestureRecognizer(target: self, action: #selector(handleCardPan))
        cardView.addGestureRecognizer(pan)
    }

    @objc private func handleCardPan(_ gesture: UIPanGestureRecognizer) {
        let translation = gesture.translation(in: view)
        let velocity = gesture.velocity(in: view)

        switch gesture.state {
        case .began:
            cardOriginalCenter = cardView.center

        case .changed:
            cardView.center = CGPoint(
                x: cardOriginalCenter.x + translation.x,
                y: cardOriginalCenter.y + translation.y
            )
            let distance = sqrt(translation.x * translation.x + translation.y * translation.y)
            let maxDistance: CGFloat = 300
            let normalizedDistance = min(distance / maxDistance, 1.0)
            cardView.alpha = 1.0 - normalizedDistance * 0.5
            let scale = 1.0 - normalizedDistance * 0.1
            cardView.transform = CGAffineTransform(scaleX: scale, y: scale)

        case .ended, .cancelled:
            let speed = sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
            let distance = sqrt(translation.x * translation.x + translation.y * translation.y)

            if speed > 1000 || distance > 150 {
                // Dismiss
                let direction = CGPoint(
                    x: velocity.x != 0 ? velocity.x : translation.x,
                    y: velocity.y != 0 ? velocity.y : translation.y
                )
                let magnitude = sqrt(direction.x * direction.x + direction.y * direction.y)
                let normalizedDirection = CGPoint(
                    x: direction.x / magnitude,
                    y: direction.y / magnitude
                )
                let offscreenPoint = CGPoint(
                    x: cardView.center.x + normalizedDirection.x * 600,
                    y: cardView.center.y + normalizedDirection.y * 600
                )

                let dismissAnim = UIViewPropertyAnimator(duration: 0.4, dampingRatio: 0.9)
                dismissAnim.addAnimations {
                    self.cardView.center = offscreenPoint
                    self.cardView.alpha = 0
                    self.cardView.transform = CGAffineTransform(scaleX: 0.5, y: 0.5)
                }
                dismissAnim.addCompletion { _ in
                    self.cardView.removeFromSuperview()
                }
                dismissAnim.startAnimation()
            } else {
                // Snap back
                let snapBack = UIViewPropertyAnimator(duration: 0.5, dampingRatio: 0.7)
                snapBack.addAnimations {
                    self.cardView.center = self.cardOriginalCenter
                    self.cardView.alpha = 1.0
                    self.cardView.transform = .identity
                }
                snapBack.startAnimation()
            }

        default:
            break
        }
    }
}
```

---

## Custom View Controller Transitions

### UIViewControllerTransitioningDelegate

Set up a view controller to use custom transition animations.

```swift
class ModalTransitionDelegate: NSObject, UIViewControllerTransitioningDelegate {
    func animationController(
        forPresented presented: UIViewController,
        presenting: UIViewController,
        source: UIViewController
    ) -> UIViewControllerAnimatedTransitioning? {
        return CustomPresentAnimator()
    }

    func animationController(
        forDismissed dismissed: UIViewController
    ) -> UIViewControllerAnimatedTransitioning? {
        return CustomDismissAnimator()
    }

    func interactionControllerForDismissal(
        using animator: UIViewControllerAnimatedTransitioning
    ) -> UIViewControllerInteractiveTransitioning? {
        return interactiveTransition.isInteracting ? interactiveTransition : nil
    }

    let interactiveTransition = PanDismissInteraction()
}
```

### UIViewControllerAnimatedTransitioning

Implement the actual animation.

```swift
class CustomPresentAnimator: NSObject, UIViewControllerAnimatedTransitioning {
    func transitionDuration(
        using transitionContext: UIViewControllerContextTransitioning?
    ) -> TimeInterval {
        return 0.5
    }

    func animateTransition(
        using transitionContext: UIViewControllerContextTransitioning
    ) {
        guard let toView = transitionContext.view(forKey: .to),
              let toVC = transitionContext.viewController(forKey: .to)
        else {
            transitionContext.completeTransition(false)
            return
        }

        let containerView = transitionContext.containerView
        let finalFrame = transitionContext.finalFrame(for: toVC)

        toView.frame = finalFrame
        toView.transform = CGAffineTransform(translationX: 0, y: finalFrame.height)
        toView.layer.cornerRadius = 20
        toView.clipsToBounds = true
        containerView.addSubview(toView)

        let duration = transitionDuration(using: transitionContext)

        let animator = UIViewPropertyAnimator(duration: duration, dampingRatio: 0.85) {
            toView.transform = .identity
        }

        animator.addCompletion { _ in
            transitionContext.completeTransition(!transitionContext.transitionWasCancelled)
        }

        animator.startAnimation()
    }
}

class CustomDismissAnimator: NSObject, UIViewControllerAnimatedTransitioning {
    func transitionDuration(
        using transitionContext: UIViewControllerContextTransitioning?
    ) -> TimeInterval {
        return 0.4
    }

    func animateTransition(
        using transitionContext: UIViewControllerContextTransitioning
    ) {
        guard let fromView = transitionContext.view(forKey: .from) else {
            transitionContext.completeTransition(false)
            return
        }

        let containerView = transitionContext.containerView
        let duration = transitionDuration(using: transitionContext)

        let animator = UIViewPropertyAnimator(duration: duration, dampingRatio: 0.9) {
            fromView.transform = CGAffineTransform(translationX: 0, y: containerView.bounds.height)
            fromView.alpha = 0.8
        }

        animator.addCompletion { _ in
            fromView.removeFromSuperview()
            transitionContext.completeTransition(!transitionContext.transitionWasCancelled)
        }

        animator.startAnimation()
    }
}
```

### UIPercentDrivenInteractiveTransition

Drive the dismissal interactively with a pan gesture.

```swift
class PanDismissInteraction: UIPercentDrivenInteractiveTransition {
    var isInteracting = false

    func attach(to viewController: UIViewController) {
        let pan = UIPanGestureRecognizer(target: self, action: #selector(handlePan))
        viewController.view.addGestureRecognizer(pan)
    }

    @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
        guard let view = gesture.view else { return }

        let translation = gesture.translation(in: view)
        let progress = max(0, min(1, translation.y / view.bounds.height))

        switch gesture.state {
        case .began:
            isInteracting = true
            // The view controller must call dismiss here
            // This triggers the transitioning delegate

        case .changed:
            update(progress)

        case .ended, .cancelled:
            isInteracting = false
            let velocity = gesture.velocity(in: view).y
            if progress > 0.4 || velocity > 800 {
                finish()
            } else {
                cancel()
            }

        default:
            break
        }
    }
}
```

### Complete Custom Modal Transition Example

```swift
// MARK: - Presenting View Controller

class HomeViewController: UIViewController {
    private let transitionDelegate = ModalTransitionDelegate()

    @objc private func showDetail() {
        let detailVC = DetailViewController()
        detailVC.modalPresentationStyle = .custom
        detailVC.transitioningDelegate = transitionDelegate
        transitionDelegate.interactiveTransition.attach(to: detailVC)
        present(detailVC, animated: true)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground

        let button = UIButton(type: .system)
        button.setTitle("Show Detail", for: .normal)
        button.titleLabel?.font = .preferredFont(forTextStyle: .headline)
        button.addTarget(self, action: #selector(showDetail), for: .touchUpInside)
        button.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(button)

        NSLayoutConstraint.activate([
            button.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            button.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
}

// MARK: - Detail View Controller

class DetailViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .secondarySystemBackground
        view.layer.cornerRadius = 20

        let label = UILabel()
        label.text = "Swipe down to dismiss"
        label.font = .preferredFont(forTextStyle: .title2)
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)

        let handle = UIView()
        handle.backgroundColor = .tertiaryLabel
        handle.layer.cornerRadius = 2.5
        handle.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(handle)

        NSLayoutConstraint.activate([
            handle.topAnchor.constraint(equalTo: view.topAnchor, constant: 12),
            handle.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            handle.widthAnchor.constraint(equalToConstant: 36),
            handle.heightAnchor.constraint(equalToConstant: 5),
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
}

// MARK: - Transition Delegate

class ModalTransitionDelegate: NSObject, UIViewControllerTransitioningDelegate {
    let interactiveTransition = PanDismissInteraction()

    func animationController(
        forPresented presented: UIViewController,
        presenting: UIViewController,
        source: UIViewController
    ) -> UIViewControllerAnimatedTransitioning? {
        return SlideUpPresentAnimator()
    }

    func animationController(
        forDismissed dismissed: UIViewController
    ) -> UIViewControllerAnimatedTransitioning? {
        return SlideDownDismissAnimator()
    }

    func interactionControllerForDismissal(
        using animator: UIViewControllerAnimatedTransitioning
    ) -> UIViewControllerInteractiveTransitioning? {
        return interactiveTransition.isInteracting ? interactiveTransition : nil
    }
}

// MARK: - Animators

class SlideUpPresentAnimator: NSObject, UIViewControllerAnimatedTransitioning {
    func transitionDuration(using ctx: UIViewControllerContextTransitioning?) -> TimeInterval { 0.5 }

    func animateTransition(using ctx: UIViewControllerContextTransitioning) {
        guard let toView = ctx.view(forKey: .to),
              let toVC = ctx.viewController(forKey: .to) else {
            ctx.completeTransition(false)
            return
        }

        let container = ctx.containerView
        let finalFrame = ctx.finalFrame(for: toVC)
        toView.frame = finalFrame.offsetBy(dx: 0, dy: finalFrame.height)
        toView.layer.cornerRadius = 20
        toView.clipsToBounds = true
        container.addSubview(toView)

        let animator = UIViewPropertyAnimator(duration: transitionDuration(using: ctx), dampingRatio: 0.85) {
            toView.frame = finalFrame
        }
        animator.addCompletion { _ in
            ctx.completeTransition(!ctx.transitionWasCancelled)
        }
        animator.startAnimation()
    }
}

class SlideDownDismissAnimator: NSObject, UIViewControllerAnimatedTransitioning {
    func transitionDuration(using ctx: UIViewControllerContextTransitioning?) -> TimeInterval { 0.4 }

    func animateTransition(using ctx: UIViewControllerContextTransitioning) {
        guard let fromView = ctx.view(forKey: .from) else {
            ctx.completeTransition(false)
            return
        }

        let container = ctx.containerView
        let animator = UIViewPropertyAnimator(duration: transitionDuration(using: ctx), dampingRatio: 0.9) {
            fromView.frame = fromView.frame.offsetBy(dx: 0, dy: container.bounds.height)
        }
        animator.addCompletion { _ in
            fromView.removeFromSuperview()
            ctx.completeTransition(!ctx.transitionWasCancelled)
        }
        animator.startAnimation()
    }
}
```

---

## Core Animation (CAAnimation)

Core Animation operates on the `CALayer` level, providing lower-level control than UIView animations. Use it for path-based animations, vector drawing, gradient effects, and complex multi-property sequences.

### CABasicAnimation

Animates a single property from one value to another.

```swift
// Position animation
let positionAnim = CABasicAnimation(keyPath: "position.y")
positionAnim.fromValue = 100
positionAnim.toValue = 400
positionAnim.duration = 0.6
positionAnim.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
positionAnim.fillMode = .forwards
positionAnim.isRemovedOnCompletion = false
layer.add(positionAnim, forKey: "moveDown")

// Opacity animation
let fadeAnim = CABasicAnimation(keyPath: "opacity")
fadeAnim.fromValue = 1.0
fadeAnim.toValue = 0.0
fadeAnim.duration = 0.3
layer.add(fadeAnim, forKey: "fadeOut")

// 3D rotation
let rotateAnim = CABasicAnimation(keyPath: "transform.rotation.y")
rotateAnim.fromValue = 0
rotateAnim.toValue = CGFloat.pi * 2
rotateAnim.duration = 1.0
rotateAnim.repeatCount = .infinity
layer.add(rotateAnim, forKey: "spin")

// Scale
let scaleAnim = CABasicAnimation(keyPath: "transform.scale")
scaleAnim.fromValue = 1.0
scaleAnim.toValue = 1.3
scaleAnim.duration = 0.4
scaleAnim.autoreverses = true
layer.add(scaleAnim, forKey: "pulse")
```

### CAKeyframeAnimation

Animates through a sequence of values or along a path.

```swift
// Values-based keyframe animation
let bounceAnim = CAKeyframeAnimation(keyPath: "transform.scale")
bounceAnim.values = [1.0, 1.4, 0.9, 1.1, 1.0]
bounceAnim.keyTimes = [0, 0.2, 0.5, 0.8, 1.0]
bounceAnim.timingFunctions = [
    CAMediaTimingFunction(name: .easeOut),
    CAMediaTimingFunction(name: .easeIn),
    CAMediaTimingFunction(name: .easeOut),
    CAMediaTimingFunction(name: .easeInEaseOut)
]
bounceAnim.duration = 0.6
layer.add(bounceAnim, forKey: "bounce")

// Path-based keyframe animation
let path = UIBezierPath()
path.move(to: CGPoint(x: 50, y: 300))
path.addCurve(
    to: CGPoint(x: 300, y: 300),
    controlPoint1: CGPoint(x: 100, y: 50),
    controlPoint2: CGPoint(x: 250, y: 550)
)

let pathAnim = CAKeyframeAnimation(keyPath: "position")
pathAnim.path = path.cgPath
pathAnim.duration = 2.0
pathAnim.rotationMode = .rotateAuto  // Rotate along path tangent
pathAnim.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
layer.add(pathAnim, forKey: "followPath")

// Shake animation
let shakeAnim = CAKeyframeAnimation(keyPath: "transform.translation.x")
shakeAnim.values = [0, -12, 12, -8, 8, -4, 4, 0]
shakeAnim.duration = 0.5
layer.add(shakeAnim, forKey: "shake")
```

### CAAnimationGroup

Combine multiple animations to run simultaneously.

```swift
let moveAnim = CABasicAnimation(keyPath: "position")
moveAnim.fromValue = CGPoint(x: 50, y: 50)
moveAnim.toValue = CGPoint(x: 300, y: 400)

let scaleAnim = CABasicAnimation(keyPath: "transform.scale")
scaleAnim.fromValue = 0.5
scaleAnim.toValue = 1.5

let fadeAnim = CABasicAnimation(keyPath: "opacity")
fadeAnim.fromValue = 0.0
fadeAnim.toValue = 1.0

let group = CAAnimationGroup()
group.animations = [moveAnim, scaleAnim, fadeAnim]
group.duration = 0.8
group.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
group.fillMode = .forwards
group.isRemovedOnCompletion = false
layer.add(group, forKey: "combined")
```

### CAShapeLayer for Vector Drawing and Path Animation

```swift
// Create a shape layer
let circleLayer = CAShapeLayer()
circleLayer.path = UIBezierPath(
    arcCenter: CGPoint(x: 100, y: 100),
    radius: 40,
    startAngle: 0,
    endAngle: .pi * 2,
    clockwise: true
).cgPath
circleLayer.fillColor = UIColor.clear.cgColor
circleLayer.strokeColor = UIColor.systemBlue.cgColor
circleLayer.lineWidth = 4
circleLayer.lineCap = .round
view.layer.addSublayer(circleLayer)

// Animate stroke drawing
let strokeAnim = CABasicAnimation(keyPath: "strokeEnd")
strokeAnim.fromValue = 0
strokeAnim.toValue = 1
strokeAnim.duration = 1.5
strokeAnim.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
circleLayer.add(strokeAnim, forKey: "drawCircle")

// Morphing between two paths
let starPath = makeStarPath(center: CGPoint(x: 100, y: 100), radius: 40)
let morphAnim = CABasicAnimation(keyPath: "path")
morphAnim.fromValue = circleLayer.path
morphAnim.toValue = starPath.cgPath
morphAnim.duration = 0.8
morphAnim.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
morphAnim.fillMode = .forwards
morphAnim.isRemovedOnCompletion = false
circleLayer.add(morphAnim, forKey: "morph")
```

### CAGradientLayer Animation

```swift
let gradientLayer = CAGradientLayer()
gradientLayer.frame = view.bounds
gradientLayer.colors = [
    UIColor.systemBlue.cgColor,
    UIColor.systemPurple.cgColor
]
gradientLayer.startPoint = CGPoint(x: 0, y: 0)
gradientLayer.endPoint = CGPoint(x: 1, y: 1)
view.layer.insertSublayer(gradientLayer, at: 0)

// Animate gradient colors
let colorAnim = CABasicAnimation(keyPath: "colors")
colorAnim.fromValue = [UIColor.systemBlue.cgColor, UIColor.systemPurple.cgColor]
colorAnim.toValue = [UIColor.systemOrange.cgColor, UIColor.systemPink.cgColor]
colorAnim.duration = 2.0
colorAnim.autoreverses = true
colorAnim.repeatCount = .infinity
gradientLayer.add(colorAnim, forKey: "colorShift")

// Animate gradient position (shimmer effect)
let shimmerAnim = CABasicAnimation(keyPath: "startPoint")
shimmerAnim.fromValue = CGPoint(x: -1, y: 0.5)
shimmerAnim.toValue = CGPoint(x: 2, y: 0.5)
shimmerAnim.duration = 1.5
shimmerAnim.repeatCount = .infinity
gradientLayer.add(shimmerAnim, forKey: "shimmer")
```

### CATransition

Layer-level transitions for content changes.

```swift
let transition = CATransition()
transition.type = .push
transition.subtype = .fromRight
transition.duration = 0.4
transition.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
containerView.layer.add(transition, forKey: "pushTransition")

// Now change the content
oldSubview.removeFromSuperview()
containerView.addSubview(newSubview)

// Available types: .fade, .moveIn, .push, .reveal
// Available subtypes: .fromLeft, .fromRight, .fromTop, .fromBottom
```

### Complete Animated Progress Ring Example

```swift
import UIKit

class ProgressRingView: UIView {
    private let trackLayer = CAShapeLayer()
    private let progressLayer = CAShapeLayer()
    private let percentageLabel = UILabel()

    var progress: CGFloat = 0 {
        didSet { updateProgress(animated: true) }
    }

    var trackColor: UIColor = .systemGray5 {
        didSet { trackLayer.strokeColor = trackColor.cgColor }
    }

    var progressColor: UIColor = .systemBlue {
        didSet { progressLayer.strokeColor = progressColor.cgColor }
    }

    var lineWidth: CGFloat = 12 {
        didSet {
            trackLayer.lineWidth = lineWidth
            progressLayer.lineWidth = lineWidth
            setNeedsLayout()
        }
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupLayers()
        setupLabel()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupLayers()
        setupLabel()
    }

    private func setupLayers() {
        trackLayer.fillColor = UIColor.clear.cgColor
        trackLayer.strokeColor = trackColor.cgColor
        trackLayer.lineWidth = lineWidth
        trackLayer.lineCap = .round
        layer.addSublayer(trackLayer)

        progressLayer.fillColor = UIColor.clear.cgColor
        progressLayer.strokeColor = progressColor.cgColor
        progressLayer.lineWidth = lineWidth
        progressLayer.lineCap = .round
        progressLayer.strokeEnd = 0
        layer.addSublayer(progressLayer)
    }

    private func setupLabel() {
        percentageLabel.textAlignment = .center
        percentageLabel.font = .systemFont(ofSize: 28, weight: .bold)
        percentageLabel.textColor = .label
        percentageLabel.translatesAutoresizingMaskIntoConstraints = false
        addSubview(percentageLabel)

        NSLayoutConstraint.activate([
            percentageLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            percentageLabel.centerYAnchor.constraint(equalTo: centerYAnchor)
        ])
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        let center = CGPoint(x: bounds.midX, y: bounds.midY)
        let radius = (min(bounds.width, bounds.height) - lineWidth) / 2
        let startAngle: CGFloat = -.pi / 2
        let endAngle: CGFloat = startAngle + .pi * 2

        let circularPath = UIBezierPath(
            arcCenter: center,
            radius: radius,
            startAngle: startAngle,
            endAngle: endAngle,
            clockwise: true
        )

        trackLayer.path = circularPath.cgPath
        progressLayer.path = circularPath.cgPath
    }

    private func updateProgress(animated: Bool) {
        let clampedProgress = max(0, min(1, progress))
        percentageLabel.text = "\(Int(clampedProgress * 100))%"

        if animated {
            let animation = CABasicAnimation(keyPath: "strokeEnd")
            animation.fromValue = progressLayer.strokeEnd
            animation.toValue = clampedProgress
            animation.duration = 0.6
            animation.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
            progressLayer.strokeEnd = clampedProgress
            progressLayer.add(animation, forKey: "progressAnimation")

            // Add color change at completion
            if clampedProgress >= 1.0 {
                let colorAnim = CABasicAnimation(keyPath: "strokeColor")
                colorAnim.fromValue = progressColor.cgColor
                colorAnim.toValue = UIColor.systemGreen.cgColor
                colorAnim.duration = 0.3
                colorAnim.beginTime = CACurrentMediaTime() + 0.5
                colorAnim.fillMode = .forwards
                colorAnim.isRemovedOnCompletion = false
                progressLayer.add(colorAnim, forKey: "colorAnimation")
            }
        } else {
            CATransaction.begin()
            CATransaction.setDisableActions(true)
            progressLayer.strokeEnd = clampedProgress
            CATransaction.commit()
        }
    }
}

// Usage
class ProgressDemoViewController: UIViewController {
    private let ring = ProgressRingView()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground

        ring.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(ring)

        NSLayoutConstraint.activate([
            ring.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            ring.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            ring.widthAnchor.constraint(equalToConstant: 200),
            ring.heightAnchor.constraint(equalToConstant: 200)
        ])

        ring.progressColor = .systemIndigo
        ring.lineWidth = 14

        let button = UIButton(type: .system)
        button.setTitle("Animate to 75%", for: .normal)
        button.titleLabel?.font = .preferredFont(forTextStyle: .headline)
        button.addTarget(self, action: #selector(animateProgress), for: .touchUpInside)
        button.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(button)

        NSLayoutConstraint.activate([
            button.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            button.topAnchor.constraint(equalTo: ring.bottomAnchor, constant: 40)
        ])
    }

    @objc private func animateProgress() {
        ring.progress = 0.75
    }
}
```

---

## Performance Tips for UIKit Animations

1. **Prefer UIViewPropertyAnimator** over `UIView.animate` for interactive, pausable, or reversible animations.
2. **Use `.beginFromCurrentState`** to smoothly interrupt and blend in-flight animations.
3. **Set `isRemovedOnCompletion = false`** and `fillMode = .forwards` only when necessary -- it prevents the system from cleaning up resources.
4. **Avoid animating `bounds`** or `frame` directly -- use `transform` for scale and translation, which bypasses layout.
5. **Use `shouldRasterize`** on layers with complex compositing (`layer.shouldRasterize = true`, `layer.rasterizationScale = UIScreen.main.scale`).
6. **Offload heavy drawing** to background threads with `CALayer.drawsAsynchronously = true`.
7. **Profile with Core Animation Instrument** to detect offscreen rendering, blending, and dropped frames.
