"use client"


import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import styles from "./Insert.module.css"


function Insert() {
  const { email } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    tags: [""],
    team: [{ name: "", position: "" }],
    finances: [{ revenue: "", expenses: "", year: "" }],
    customSections: [{ title: "", description: "" }],
  })
  const [error, setError] = useState("")
  const [profilePicFile, setProfilePicFile] = useState(null)
  const [sliderImageFiles, setSliderImageFiles] = useState([])


  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "revenue" || name === "expenses" || name === "year") {
      setFormData({ ...formData, finances: { ...formData.finances, [name]: value } })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }
  /** this is new finances s */
  const handleFinanceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFinances = [...formData.finances];
    updatedFinances[index][name] = value;
    setFormData({ ...formData, finances: updatedFinances });
  };

  const addFinanceSection = () => {
    setFormData({
      ...formData,
      finances: [...formData.finances, { revenue: "", expenses: "", year: "" }],
    });
  };

  const removeFinanceSection = (index) => {
    const updatedFinances = [...formData.finances];
    updatedFinances.splice(index, 1);
    setFormData({ ...formData, finances: updatedFinances });
  };

  /** above is new finances s */




  const handleTagChange = (index, e) => {
    const updatedTags = [...formData.tags]
    updatedTags[index] = e.target.value
    setFormData({ ...formData, tags: updatedTags })
  }


  const addTag = () => setFormData({ ...formData, tags: [...formData.tags, ""] })


  const removeTag = (index) => {
    const updatedTags = [...formData.tags]
    updatedTags.splice(index, 1)
    setFormData({ ...formData, tags: updatedTags })
  }

  const removeTeamMember = (index) => {
    const updatedTeam = [...formData.team]
    updatedTeam.splice(index, 1)
    setFormData({ ...formData, team: updatedTeam })
  }

  const handleTeamChange = (index, e) => {
    const { name, value } = e.target
    const updatedTeam = [...formData.team]
    updatedTeam[index][name] = value
    setFormData({ ...formData, team: updatedTeam })
  }


  const addTeamMember = () => {
    setFormData({ ...formData, team: [...formData.team, { name: "", position: "" }] })
  }


  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePicFile(file)
      setError("")
    } else {
      setError("Please select a profile picture.")
    }
  }


  const handleSliderImagesChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length < 1) {
      setError("Please upload at least one slider image.")
      return
    }
    setSliderImageFiles(files)
    setError("")
  }


  const handleCustomSectionChange = (index, e) => {
    const { name, value } = e.target
    const updatedSections = [...formData.customSections]
    updatedSections[index][name] = value
    setFormData({ ...formData, customSections: updatedSections })
  }


  const addCustomSection = () => {
    setFormData({
      ...formData,
      customSections: [...formData.customSections, { title: "", description: "" }],
    })
  }


  const handleSubmit = async (e) => {
    e.preventDefault()


    if (
      !formData.productName ||
      !formData.description ||
      formData.tags.length === 0 ||
      !profilePicFile ||
      sliderImageFiles.length < 1 ||
      !email
    ) {
      setError("All fields, profile picture, and at least one slider image are required.")
      return
    }


    const formDataToSend = new FormData()
    formDataToSend.append("productName", formData.productName)
    formDataToSend.append("description", formData.description)
    formDataToSend.append("email", email)


    formDataToSend.append("tags", JSON.stringify(formData.tags))
    formDataToSend.append("team", JSON.stringify(formData.team))
    formDataToSend.append("finances", JSON.stringify(formData.finances)) // Note: backend expects array of finances
    formDataToSend.append("customSections", JSON.stringify(formData.customSections))


    // Add profile picture
    formDataToSend.append("profilePic", profilePicFile)


    // Add slider images
    sliderImageFiles.forEach((file) => {
      formDataToSend.append("sliderImages", file)
    })


    try {
      await axios.post("http://localhost:3001/add-product", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      navigate(`/company/${email}`)
    } catch (err) {
      console.error("Error response:", err.response)
      setError("Failed to add product. Try again later.")
    }
  }


  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add Product</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Product Name:</label>
        <input
          type="text"
          name="productName"
          placeholder="Product Name"
          value={formData.productName}
          onChange={handleChange}
          required
        />


        <label>Description:</label>
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <h3>Tags</h3>
        <div className={styles.tagList}>
          {formData.tags.map((tag, index) => (
            <div key={index} className={styles.tagInputContainer}>
              <input
                type="text"
                placeholder="Tag"
                value={tag}
                onChange={(e) => handleTagChange(index, e)}
                required
              />
              {formData.tags.length > 1 && (
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.remove}`}
                  onClick={() => removeTag(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className={styles.actionButton} onClick={addTag}>
          + Add Tag
        </button>




        <h3>Team Members</h3>
        <div className={styles.teamList}>
          {formData.team.map((member, index) => (
            <div key={index} className={styles.teamMemberContainer}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={member.name}
                onChange={(e) => handleTeamChange(index, e)}
                required
              />
              <input
                type="text"
                name="position"
                placeholder="Position"
                value={member.position}
                onChange={(e) => handleTeamChange(index, e)}
                required
              />
              {formData.team.length > 1 && (
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.remove}`}
                  onClick={() => removeTeamMember(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className={styles.actionButton} onClick={addTeamMember}>
          + Add Team Member
        </button>



        <h3>Finances</h3>
        {formData.finances.map((finance, index) => (
          <div key={index} className={styles.dynamicSection}>
            <input
              type="text"
              name="year"
              placeholder="Year"
              value={finance.year}
              onChange={(e) => handleFinanceChange(index, e)}
              required
            />
            <input
              type="text"
              name="revenue"
              placeholder="Revenue"
              value={finance.revenue}
              onChange={(e) => handleFinanceChange(index, e)}
              required
            />
            <input
              type="text"
              name="expenses"
              placeholder="Expenses"
              value={finance.expenses}
              onChange={(e) => handleFinanceChange(index, e)}
              required
            />
            {formData.finances.length > 1 && (
              <button
                type="button"
                className={`${styles.actionButton} ${styles.remove}`}
                onClick={() => removeFinanceSection(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className={styles.actionButton} onClick={addFinanceSection}>
          + Add Finance Section
        </button>




        <h3>Custom Sections</h3>
        {formData.customSections.map((section, index) => (
          <div key={index} className={styles.dynamicSection}>
            <input
              type="text"
              name="title"
              placeholder="Section Title"
              value={section.title}
              onChange={(e) => handleCustomSectionChange(index, e)}
              required
            />
            <textarea
              name="description"
              placeholder="Section Description"
              value={section.description}
              onChange={(e) => handleCustomSectionChange(index, e)}
              required
            />
          </div>
        ))}
        <button type="button" className={styles.actionButton} onClick={addCustomSection}>
          + Add Custom Section
        </button>


        <h3>Upload Profile Picture</h3>
        <input type="file" accept="image/*" onChange={handleProfilePicChange} required />


        <h3>Upload Slider Images</h3>
        <input type="file" multiple accept="image/*" onChange={handleSliderImagesChange} required />


        <button type="submit">Add Product</button>
      </form>
    </div>
  )
}


export default Insert


