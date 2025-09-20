"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import styles from "./Update.module.css"

const UpdateProduct = () => {
    const { email } = useParams()
    const navigate = useNavigate()

    const [product, setProduct] = useState({
        productName: "",
        description: "",
        tags: [],
        team: [],
        images: [],
        finances: [],
        dynamicSections: [],
        email: "",
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [newTag, setNewTag] = useState("")
    const [newMember, setNewMember] = useState({ name: "", position: "" })
    const [newFinance, setNewFinance] = useState({ revenue: "", expenses: "", year: "" })
    const [newSection, setNewSection] = useState({ title: "", description: "" })

    useEffect(() => {
        axios
            .get(`http://localhost:3001/product/${email}`)
            .then((response) => {
                if (response.data.status === "Success" && response.data.product) {
                    const productData = response.data.product
                    setProduct({
                        ...productData,
                        dynamicSections: productData.customSections || [],
                    })
                } else {
                    setError("Failed to load product details.")
                }
            })
            .catch((error) => {
                console.error("Error fetching product:", error)
                setError("Error fetching product details. Try again later.")
            })
            .finally(() => setLoading(false))
    }, [email])

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value })
    }

    const handleAddTag = () => {
        if (newTag.trim() !== "" && !product.tags.includes(newTag.trim())) {
            setProduct({ ...product, tags: [...product.tags, newTag.trim()] })
            setNewTag("")
        }
    }

    const handleRemoveTag = (tagToRemove) => {
        setProduct({ ...product, tags: product.tags.filter((tag) => tag !== tagToRemove) })
    }

    const handleAddTeamMember = () => {
        if (newMember.name.trim() && newMember.position.trim()) {
            setProduct({ ...product, team: [...product.team, newMember] })
            setNewMember({ name: "", position: "" })
        }
    }

    const handleRemoveTeamMember = (index) => {
        setProduct({ ...product, team: product.team.filter((_, i) => i !== index) })
    }

    const handleAddFinance = () => {
        if (newFinance.year.trim()) {
            const financeEntry = {
                revenue: Number(newFinance.revenue) || 0,
                expenses: Number(newFinance.expenses) || 0,
                year: Number(newFinance.year),
            }
            setProduct({ ...product, finances: [...product.finances, financeEntry] })
            setNewFinance({ revenue: "", expenses: "", year: "" })
        }
    }

    const handleRemoveFinance = (index) => {
        setProduct({ ...product, finances: product.finances.filter((_, i) => i !== index) })
    }

    const handleAddDynamicSection = () => {
        if (newSection.title.trim() || newSection.description.trim()) {
            setProduct({
                ...product,
                dynamicSections: [...(product.dynamicSections || []), newSection],
            })
            setNewSection({ title: "", description: "" })
        }
    }

    const handleDynamicSectionChange = (index, field, value) => {
        const updated = [...(product.dynamicSections || [])]
        if (!updated[index]) {
            updated[index] = {}
        }
        updated[index][field] = value
        setProduct({ ...product, dynamicSections: updated })
    }

    const handleRemoveDynamicSection = (index) => {
        const updated = [...product.dynamicSections]
        updated.splice(index, 1)
        setProduct({ ...product, dynamicSections: updated })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            for (let section of product.dynamicSections || []) {
                if (!section?.title?.trim() || !section?.description?.trim()) {
                    alert("All custom sections must have both title and content filled.")
                    return
                }
            }

            const updatedProduct = {
                ...product,
                customSections: product.dynamicSections?.map((section) => ({
                    title: section.title.trim(),
                    description: section.description.trim(),
                })),
            }

            const response = await axios.post(
                `http://localhost:3001/update-product/${email}`,
                updatedProduct
            )
            if (response.data.status === "Success") {
                alert("Product updated successfully!")
                navigate(`/company/${email}`)
            } else {
                setError("Failed to update product.")
            }
        } catch (err) {
            console.error("Error updating product:", err)
            setError("Error updating product. Try again later.")
        }
    }

    return (
        <div className={styles.container}>
            <h2>Update Product</h2>
            {loading ? (
                <p>Loading product details...</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label>Product Name:</label>
                    <input type="text" name="productName" value={product.productName} onChange={handleChange} required />

                    <label>Description:</label>
                    <textarea name="description" value={product.description} onChange={handleChange} required />

                    <label>Tags:</label>
                    <div className={styles.tagInputContainer}>
                        <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add new tag" />
                        <button type="button" className={styles.actionButton} onClick={handleAddTag}>
                            Add
                        </button>
                    </div>
                    <div className={styles.tagList}>
                        {product.tags.map((tag, index) => (
                            <div key={index}>
                                {tag}{" "}
                                <button
                                    type="button"
                                    className={`${styles.actionButton} ${styles.remove}`}
                                    onClick={() => handleRemoveTag(tag)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <h3>Team Members</h3>
                    {product.team.map((member, index) => (
                        <div key={index}>
                            <span>{member.name} - {member.position}</span>
                            <button type="button" className={`${styles.actionButton} ${styles.remove}`} onClick={() => handleRemoveTeamMember(index)}>
                                Remove
                            </button>
                        </div>
                    ))}
                    <input type="text" placeholder="Name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
                    <input type="text" placeholder="Position" value={newMember.position} onChange={(e) => setNewMember({ ...newMember, position: e.target.value })} />
                    <button type="button" className={styles.actionButton} onClick={handleAddTeamMember}>Add Member</button>

                    <h3>Finances</h3>
                    {product.finances.map((finance, index) => (
                        <div key={index}>
                            <span>Year: {finance.year}, Revenue: {finance.revenue}, Expenses: {finance.expenses}</span>
                            <button type="button" className={`${styles.actionButton} ${styles.remove}`} onClick={() => handleRemoveFinance(index)}>
                                Remove
                            </button>
                        </div>
                    ))}
                    <input type="number" placeholder="Year" value={newFinance.year} onChange={(e) => setNewFinance({ ...newFinance, year: e.target.value })} />
                    <input type="number" placeholder="Revenue" value={newFinance.revenue} onChange={(e) => setNewFinance({ ...newFinance, revenue: e.target.value })} />
                    <input type="number" placeholder="Expenses" value={newFinance.expenses} onChange={(e) => setNewFinance({ ...newFinance, expenses: e.target.value })} />
                    <button type="button" className={styles.actionButton} onClick={handleAddFinance}>Add Finance</button>

                    <h3>Custom Sections</h3>
                    <div className={styles.sectionList}>
                        {(product.dynamicSections || []).map((section, index) => (
                            <div key={index} className={styles.sectionContainer}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionTitleRow}>
                                        <input
                                            type="text"
                                            value={section.title || ''}
                                            onChange={(e) => handleDynamicSectionChange(index, "title", e.target.value)}
                                            className={styles.sectionInput}
                                            placeholder="Section Title"
                                        />
                                        <button
                                            type="button"
                                            className={`${styles.actionButton} ${styles.remove}`}
                                            onClick={() => handleRemoveDynamicSection(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <textarea
                                        value={section.description || ''}
                                        onChange={(e) => handleDynamicSectionChange(index, "description", e.target.value)}
                                        className={styles.sectionTextarea}
                                        placeholder="Section Content"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.addSectionForm}>
                        <input
                            type="text"
                            placeholder="Section Title"
                            value={newSection.title}
                            onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                            className={styles.sectionInput}
                        />
                        <textarea
                            placeholder="Section Content"
                            value={newSection.description}
                            onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                            className={styles.sectionTextarea}
                        />
                        <button 
                            type="button" 
                            className={styles.actionButton}
                            onClick={handleAddDynamicSection}
                        >
                            Add Section
                        </button>
                    </div>

                    <label>Email (Cannot be changed):</label>
                    <input type="email" name="email" value={product.email} disabled />

                    <button type="submit">Update Product</button>
                </form>
            )}
        </div>
    )
}

export default UpdateProduct
