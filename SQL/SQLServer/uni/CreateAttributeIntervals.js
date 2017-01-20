/*~
-- ATTRIBUTE INTERVALS ------------------------------------------------------------------------------------------------
--
-- These table valued functions shows all rows that have
-- been in effect between two points in changing time.
--
-- @intervalStart   the starting point in changing time
-- @intervalEnd   the ending point in changing time
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    var attribute;
    while (attribute = anchor.nextAttribute()) {
        if(attribute.isHistorized()) {
/*~
-- Attribute interval -------------------------------------------------------------------------------------------------
-- i$attribute.name interval over changing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.i$attribute.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[i$attribute.name] (
        $(attribute.isEquivalent())? @equivalent $schema.metadata.equivalentRange,
        @intervalStart $attribute.timeRange,
        @intervalEnd $attribute.timeRange
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.anchorReferenceName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $(!attribute.isKnotted() && attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.valueColumnName,
        $attribute.changingColumnName
    FROM
        $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](@equivalent) : [$attribute.capsule].[$attribute.name]
    WHERE
        $attribute.changingColumnName BETWEEN @intervalStart AND @intervalEnd;
    ');
END
GO
~*/
        }
    }
}
