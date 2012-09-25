#pragma strict
var forceMultiplier : int = 800;
var horizontalDrag : int = -5;
var verticalDrag : float = -0.01;

var eulerAngleVelocity : Vector3 = Vector3 (0, 70, 0);

var minVelOrient : float = 0.5;
var dampingRate : float = 5.0;
var rayLength : float = 10.0;
var turnComp : float = 2.0;
var realignmentDistance : float = 50;
//private var mask : int;
private var currentUp = Vector3.up;
private var lastRotation : Quaternion;

function G2Curve(x) : float
{
    return 1.0 / Mathf.Pow(2.7183, Mathf.Pow(x, 6.0));
}

function Start() {
}

function Update () {
}

function FixedUpdate () {

	var deltaRotation : Quaternion = Quaternion.Euler(eulerAngleVelocity * Time.deltaTime * Input.GetAxis("Horizontal"));
	rigidbody.rotation *= deltaRotation;
	// This assumes a and b are unit vectors
	var deltaRotationDeflection : float = 1.0 - Mathf.Pow(Vector3.Dot(deltaRotation * Vector3.fwd, Vector3.fwd), turnComp);
	
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
	        lastRotation = targetRotation = Quaternion.LookRotation(hitB.point - hitA.point, hitA.normal);
	    }
	}
	
	
	var euler = lastRotation.eulerAngles;
    euler.y = rigidbody.rotation.eulerAngles.y;
    
    // Distance between bottom of the vehicle and the ground
    var pulldown = collider.bounds.size.y / 2.0 - hitA.distance;
    
    // Smoothly conform to the ground normals
    rigidbody.rotation = Quaternion.Slerp (
        rigidbody.rotation, Quaternion.Euler(euler),
        Time.deltaTime * dampingRate);
    
    // Remove roll (and pitch, currently) from rotation based on distance from ground hit
    rigidbody.rotation = Quaternion.Slerp(
        rigidbody.rotation,
        Quaternion.Euler(0.0, rigidbody.rotation.eulerAngles.y, 0.0),
        0.05 * (1.0 - G2Curve(pulldown / realignmentDistance)) * dampingRate);


	//This applies force for forward/backward motion.
    rigidbody.AddRelativeForce (Vector3.forward * Input.GetAxis("Vertical") * forceMultiplier);
    //This gets the local velocity vector and stores it for a bit so it isn't looked up like, a billion times.
    var localVelocity : Vector3 = transform.InverseTransformDirection(rigidbody.velocity);
    //Drag for all horizontal movement, proportional to velocity. It's also where vertical drag can be added.
    //Technically the drag on an object through a fluid should be proportional to v^2, but eh, it's a game.
    rigidbody.AddRelativeForce (horizontalDrag * localVelocity.x, verticalDrag * localVelocity.y, horizontalDrag * localVelocity.z);
    
    //Rotate the vehicle
    rigidbody.MoveRotation(rigidbody.rotation * deltaRotation);
    //Deflect based on turning
    rigidbody.AddRelativeForce (-Vector3(localVelocity.x, 0.0, 0.0) * deltaRotationDeflection, ForceMode.Acceleration);
    Debug.Log(deltaRotationDeflection);
    rigidbody.AddForce(Vector3(0.0, pulldown, 0.0), ForceMode.Acceleration);
    
}