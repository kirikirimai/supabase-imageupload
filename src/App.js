
import './App.css';
import { Container, Form, Button,Card,Row,Col } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from "uuid"

const CDNURL = "https://eucwabbsxbyuredvgrnj.supabase.co/storage/v1/object/public/images/"

function App() {
  const [email, setEmail] = useState("")
  const [images, setImages] = useState([])

  const user = useUser()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if(user){
      getImages()
    }
  },[user])

  const getImages = async () => {
    const { data, error } = await supabase.storage.from("images").list(user?.id + "/", {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" }
    })

    if (data !== null) {
      setImages(data)
    } else {
      alert("errorr ")
      console.log(error)
    }
  }

  const maginLinkLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOtp({ email: email })

    if (error) {
      alert(error.message)
    } else {
      alert("Check your email for the magic link login")
    }
  }

  const singOut = async () => {
    const { error } = await supabase.auth.signOut()
  }

  const uploadImage = async (e) => {
    let file = e.target.files[0]
    //userid

    const { data, error } = await supabase.storage.from("images").upload(`${user.id}/${uuidv4()}`, file)

    if (data) {
      getImages()
    } else {
      console.log(error)
    }
  }

  const deleteImage = async (name) => {
    const {error}=await supabase.storage.from("images").remove([`${user.id}/${name}`])

    if(error){
      alert(error.message)
    }else{
      getImages()
    }
  }

  console.log(user)
  return (
    <Container align="Center" className='container-sm mt-4'>
      {user === null ?
        <>
          <h1>Welcom to IamgeWall</h1>
          <Form>
            <Form.Group style={{ maxWidth: "500px" }} controlId="formBasicEmail" className='mb-3'>
              <Form.Label>Email address</Form.Label>
              <Form.Control onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter email" />
            </Form.Group>
            <Button onClick={() => maginLinkLogin()} variant="primary" type="button">
              Get Magic Link
            </Button>
          </Form>
        </>
        :
        <>
          <h1>Your InmageWall</h1>
          <Button onClick={singOut} >Sign Out</Button>
          <p>Current User:{user.email}</p>
          <p>画像アップロード</p>
          <Form.Group style={{ maxWidth: "500px" }} controlId="formBasicEmail" className='mb-3'>
            <Form.Control type="file" accept='image/png,image/jpeg' onChange={(e) => uploadImage(e)} />
          </Form.Group>
          <hr />
          <h3>Upload Image</h3>
          {/* 
            image:CDNURL+user.id+"."+image.name 
          */}
          <Row xs={1} md={3} className="g-4">
            {images.map((image) => (
              <Col>
                <Card>
                  <Card.Img variant="top" src={CDNURL + user.id + "/" + image.name} />
                  <Card.Body>
                    <Button variant='danger' onClick={()=>deleteImage(image.name)}>Delete image</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
            }
          </Row>

        </>
      }
    </Container>
  );
}

export default App;
