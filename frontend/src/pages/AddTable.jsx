import BASE_URL from '../config';
import React from 'react'



function AddTable() {

    const [survey_table_name, setSurveytablename] = useState<string>("");
    const handletablecreation = async ()=>{
       
        const response = await axios.post(`${BASE_URL}/addsurvey`,{
            survey_name : survey_name
        })
        console.log(response);
        
    }


    return (
    <>
    
        <div>
            <input type="file" placeholder='Add the table name' onChange={(e)=>{e.target.value}}/>
            <button onClick={handletablecreation}>Add the table</button>
        </div>    
    </>
  )
}

export default AddTable