var speed = 800;
var eulerAngleVelocity : Vector3 = Vector3 (0, 100, 0);

//function Update () {
//	var deltaRotation : Quaternion = Quaternion.Euler(eulerAngleVelocity * Time.deltaTime * Input.GetAxis("Horizontal"));
//    rigidbody.MoveRotation(rigidbody.rotation * deltaRotation);
//}

function FixedUpdate () {
	var deltaRotation : Quaternion = Quaternion.Euler(eulerAngleVelocity * Time.deltaTime * Input.GetAxis("Horizontal"));
    rigidbody.MoveRotation(rigidbody.rotation * deltaRotation);
    rigidbody.MovePosition(rigidbody.transform.forward * speed * Time.deltaTime * Input.GetAxis("Vertical") + transform.position);
}