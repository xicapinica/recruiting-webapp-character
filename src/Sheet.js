import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';

const Sheet = ({ characterData, number, onSave }) => {
    const [attributes, setAttributes] = useState(() =>
        ATTRIBUTE_LIST.map(item => ({
            label: item,
            points: 10,
            modifier: 0
        }))
    );
    const [skills, setSkills] = useState(() =>
        SKILL_LIST.map(skill => ({
            name: skill.name,
            modifier: skill.attributeModifier,
            points: 0,
            total: 0
        }))
    );

    useEffect(() => {
        if (characterData && characterData.attributes && characterData.skills) {
            // Update downloaded skills
            setSkills(prevSkills => prevSkills.map(skill => ({
                ...skill,
                points: characterData.skills[skill.name]
            })));
            // Update downloaded attributes
            const dataAttr = characterData.attributes;
            setAttributes(prevAttr => prevAttr.map(attr => {
                const calcModifier = calculateModifier(dataAttr[attr.label]);
                updateSkills({ label: attr.label, modifier: calcModifier });
                return {
                    ...attr,
                    points: dataAttr[attr.label],
                    modifier: calcModifier
                }
            }));
        }
    }, [characterData]);

    const pointsSum = useMemo(() =>
        attributes.reduce((sum, attr) => sum + attr.points, 0),
        [attributes]
    );

    const skillPointsSum = useMemo(() =>
        skills.reduce((sum, skill) => sum + skill.points, 0),
        [skills]
    );

    const availablePoints = useMemo(() => {
        const intelligenceAttr = attributes.find(a => a.label === 'Intelligence');
        return 10 + 4 * intelligenceAttr.modifier;
    }, [attributes]);

    const calculateModifier = useCallback((points) => {
        return Math.floor((points - 10) / 2);
    }, []);

    const updateSkills = useCallback((attribute) => {
        setSkills(prevSkills => prevSkills.map(skill => {
            if (skill.modifier === attribute.label) {
                return {
                    ...skill,
                    total: skill.points + attribute.modifier
                };
            }
            return skill;
        }));
    }, []);

    const incrementPoints = useCallback((index) => {
        if (pointsSum === 70) {
            alert(`Total attribute points cannot exceed 70.`);
            return
        }

        setAttributes(prevAttributes => {
            let relatedSkills = null;
            const attrUpdated = prevAttributes.map((attr, i) => {
                if (i === index) {
                    const newPoints = attr.points + 1;
                    const newModifier = calculateModifier(newPoints);
                    if (attr.modifier !== newModifier) {
                        relatedSkills = { label: attr.label, modifier: newModifier };
                    }
                    return {
                        ...attr,
                        points: newPoints,
                        modifier: newModifier
                    };
                }
                return attr;
            });

            if (relatedSkills) updateSkills(relatedSkills);
            return attrUpdated;
        });
    }, [calculateModifier, pointsSum, updateSkills]);

    const decrementPoints = useCallback((index) => {
        setAttributes(prevAttributes => {
            let relatedSkills = null;
            const attrUpdated = prevAttributes.map((attr, i) => {
                if (i === index && attr.points > 0) {
                    const newPoints = attr.points - 1;
                    const newModifier = calculateModifier(newPoints);
                    if (attr.modifier !== newModifier) {
                        relatedSkills = { label: attr.label, modifier: newModifier };
                    }
                    return {
                        ...attr,
                        points: newPoints,
                        modifier: newModifier
                    };
                }
                return attr;
            });

            if (relatedSkills) updateSkills(relatedSkills);
            return attrUpdated;
        });
    }, [calculateModifier, updateSkills]);

    const incrementSkill = useCallback((index) => {
        if (skillPointsSum === availablePoints) {
            alert(`Total skills points exceed ${availablePoints}. Add more Intelligence modifier to have more points available.`);
            return;
        }

        setSkills(prevSkills => {
            const skillsUpdated = prevSkills.map((skill, i) => {
                if (i === index) {
                    const linkedAttribute = attributes.find(attr => attr.label === skill.modifier);
                    const newPoints = skill.points + 1;
                    return {
                        ...skill,
                        points: newPoints,
                        total: newPoints + linkedAttribute.modifier
                    };
                }
                return skill;
            });

            return skillsUpdated;
        });
    }, [availablePoints, attributes, skillPointsSum]);

    const decrementSkill = useCallback((index) => {
        setSkills(prevSkills => {
            const skillsUpdated = prevSkills.map((skill, i) => {
                if (i === index && skill.points > 0) {
                    return {
                        ...skill,
                        points: skill.points - 1,
                        total: skill.total - 1
                    };
                }
                return skill;
            });

            return skillsUpdated;
        });
    }, []);

    const checkClassRequirements = useCallback((requirements) => {
        return Object.keys(requirements).every((key) => {
            const attribute = attributes.find(a => a.label === key);
            return attribute.points >= requirements[key];
        });
    }, [attributes]);

    const handleSaveCharacter = () => {
        const saveAttr = attributes.reduce((acc, attr) => {
            acc[attr.label] = attr.points;
            return acc;
        }, {});
        const saveSkills = skills.reduce((acc, skill) => {
            acc[skill.name] = skill.points;
            return acc;
        }, {});

        if (onSave) onSave({
            attributes: saveAttr,
            skills: saveSkills
        })
    }

    return (
        <>
            <div style={{ display: 'flex', padding: '20px', columnGap: '32px' }}>
                <div style={{ textAlign: 'left' }}>
                    <h2>{`Character #${number}`}</h2>
                    <h3>{'Attributes'}</h3>
                    {attributes.map((item, index) => (
                        <div key={index}>
                            <span>{`${item.label}: ${item.points} - Modifier: ${item.modifier}`}</span>
                            <button type='button' onClick={() => incrementPoints(index)}>+</button>
                            <button type='button' onClick={() => decrementPoints(index)}>-</button>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'left' }}>
                    <h3>{'Classes'}</h3>
                    {Object.keys(CLASS_LIST).map((key) => (
                        <div key={key}>
                            <div style={{ color: checkClassRequirements(CLASS_LIST[key]) ? '#00FF00' : '#ff0000' }}>
                                {key}
                            </div>
                            {Object.keys(CLASS_LIST[key]).map(classKey => (
                                <div key={classKey}>
                                    {`${classKey}: ${CLASS_LIST[key][classKey]}`}
                                </div>
                            ))}
                            <br />
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'left' }}>
                    <h3>{'Skills'}</h3>
                    <span>{`Points available to add skills: ${availablePoints}`}</span>
                    <br /><br />
                    {skills.map((skill, index) => (
                        <div key={index}>
                            <span>{`${skill.name} - Points: ${skill.points} (Modifier: ${skill.modifier}) - Total: ${skill.total}`}</span>
                            <button type='button' onClick={() => incrementSkill(index)}>+</button>
                            <button type='button' onClick={() => decrementSkill(index)}>-</button>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <button onClick={() => handleSaveCharacter()}>{'Save character'}</button>
            </div>
            <div style={{ padding: '16px' }}>
                <h3>{'Skill check'}</h3>
                <div style={{ display: 'flex', columnGap: '20px', justifyContent: 'center' }}>
                    <select id="dropdown">
                        {skills.map((skill, index) => (
                            <option value={skill.name} key={index}>
                                {skill.name}
                            </option>
                        ))}
                    </select>
                    
                    <input type='text' value={20} disabled />

                    <button onClick='#'>Roll</button>
                </div>
            </div>
        </>
    );
}

export default Sheet;
