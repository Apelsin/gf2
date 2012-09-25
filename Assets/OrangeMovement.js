
var forceMultiplier = 400;
var velocityDamping = -1;
var turnComp = 2.0;
var realignmentDistance = 50;

var eulerAngleVelocity : Vector3 = Vector3 (0, 100, 0);

var minVelOrient = 0.5;
var dampingRate = 5.0;
var rayLength = 10.0;
//private var mask : int;
private var currentUp = Vector3.up;

function Start() {
rigidbody.maxAngularVelocity = 5;
//rigidbody.centerOfMass = Vector3 (0, -7, 0);
//var horizontalForce = 20;
}

function Update () {
}

function G6Curve(x)
{
    return 1.0 / Mathf.Pow(2.7183, Mathf.Pow(x, 6.0));
}

function FixedUpdate () {

    var deltaRotation : Quaternion = Quaternion.Euler(eulerAngleVelocity * Time.deltaTime * Input.GetAxis("Horizontal")); 
    rigidbody.rotation *= deltaRotation;
    // This assumes a and b are unit vectors
    var deltaRotationDeflection = 1.0 - Mathf.Pow(Vector3.Dot(deltaRotation * Vector3.fwd, Vector3.fwd), 1.0 + turnComp);

    var hitA : RaycastHit;
    var hitB : RaycastHit;
    Physics.Raycast(transform.position, transform.forward - currentUp, hitA, rayLength, 0xFFFFFFFF);
    if (hitA.normal != Vector3.zero) {
        //currentUp = hitA.normal;
    }
    
    var targetRotation = transform.rotation;
    if (rigidbody.velocity.magnitude > minVelOrient)
    {
        if (Physics.Raycast(transform.position + transform.forward, transform.forward - currentUp, hitB, rayLength, 0xFFFFFFFF))
        {
            targetRotation = Quaternion.LookRotation(hitB.point - hitA.point, hitA.normal);
        }
    }
    
    var euler = targetRotation.eulerAngles;
    euler.y = rigidbody.rotation.eulerAngles.y;
    
    // Distance between bottom of the vehicle and the ground
    var pulldown = collider.bounds.size.y / 2.0 - hitA.distance;
    
    rigidbody.rotation = Quaternion.Slerp (
        rigidbody.rotation, Quaternion.Euler(euler),
        Time.deltaTime * dampingRate);
    
    rigidbody.rotation = Quaternion.Slerp(
        rigidbody.rotation,
        Quaternion.Euler(0.0, rigidbody.rotation.eulerAngles.y, 0.0),
        0.01 * (1.0 - G6Curve(pulldown / realignmentDistance)) * dampingRate);
    rigidbody.AddRelativeForce (velocityDamping * rigidbody.velocity.x, -10, velocityDamping * rigidbody.velocity.z);
    rigidbody.AddRelativeForce (Vector3.forward * Input.GetAxis("Vertical") * forceMultiplier);
    rigidbody.AddRelativeForce (rigidbody.velocity * deltaRotationDeflection);
    rigidbody.AddForce(Vector3(0.0, pulldown, 0.0), ForceMode.Acceleration);
    
}